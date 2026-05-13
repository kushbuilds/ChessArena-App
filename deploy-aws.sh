#!/bin/bash
set -e

# ============================================================
# ChessArena AWS Deployment Script (Free Tier)
# EC2 t2.micro + RDS MySQL db.t3.micro (free tier eligible)
# ============================================================

REGION="ap-south-1"
APP_NAME="chessarena"
KEY_NAME="${APP_NAME}-key"
SG_NAME="${APP_NAME}-sg"
DB_SG_NAME="${APP_NAME}-db-sg"
DB_INSTANCE="${APP_NAME}-db"
DB_NAME="chessarena"
DB_USER="admin"
DB_PASS="ChessArena2026!"  # Change this!
INSTANCE_TYPE="t2.micro"
DB_INSTANCE_CLASS="db.t3.micro"

echo "=== ChessArena AWS Deployment ==="
echo "Region: $REGION"
echo ""

# --- 1. Create Key Pair ---
echo "[1/8] Creating key pair..."
if aws ec2 describe-key-pairs --key-names "$KEY_NAME" --region "$REGION" 2>/dev/null; then
    echo "  Key pair already exists."
else
    aws ec2 create-key-pair --key-name "$KEY_NAME" --region "$REGION" \
        --query 'KeyMaterial' --output text > "${KEY_NAME}.pem"
    chmod 400 "${KEY_NAME}.pem"
    echo "  Created ${KEY_NAME}.pem"
fi

# --- 2. Get Default VPC ---
echo "[2/8] Getting default VPC..."
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" \
    --region "$REGION" --query 'Vpcs[0].VpcId' --output text)
echo "  VPC: $VPC_ID"

# --- 3. Create Security Groups ---
echo "[3/8] Creating security groups..."

# EC2 Security Group
EC2_SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=$SG_NAME" "Name=vpc-id,Values=$VPC_ID" \
    --region "$REGION" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null)

if [ "$EC2_SG_ID" = "None" ] || [ -z "$EC2_SG_ID" ]; then
    EC2_SG_ID=$(aws ec2 create-security-group --group-name "$SG_NAME" \
        --description "ChessArena EC2 SG" --vpc-id "$VPC_ID" \
        --region "$REGION" --query 'GroupId' --output text)
    # Allow SSH, HTTP
    aws ec2 authorize-security-group-ingress --group-id "$EC2_SG_ID" --region "$REGION" \
        --ip-permissions \
        '[{"IpProtocol":"tcp","FromPort":22,"ToPort":22,"IpRanges":[{"CidrIp":"0.0.0.0/0"}]},
          {"IpProtocol":"tcp","FromPort":8080,"ToPort":8080,"IpRanges":[{"CidrIp":"0.0.0.0/0"}]},
          {"IpProtocol":"tcp","FromPort":80,"ToPort":80,"IpRanges":[{"CidrIp":"0.0.0.0/0"}]}]'
    echo "  Created EC2 SG: $EC2_SG_ID"
else
    echo "  EC2 SG exists: $EC2_SG_ID"
fi

# RDS Security Group
DB_SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=$DB_SG_NAME" "Name=vpc-id,Values=$VPC_ID" \
    --region "$REGION" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null)

if [ "$DB_SG_ID" = "None" ] || [ -z "$DB_SG_ID" ]; then
    DB_SG_ID=$(aws ec2 create-security-group --group-name "$DB_SG_NAME" \
        --description "ChessArena RDS SG" --vpc-id "$VPC_ID" \
        --region "$REGION" --query 'GroupId' --output text)
    # Allow MySQL from EC2 SG
    aws ec2 authorize-security-group-ingress --group-id "$DB_SG_ID" --region "$REGION" \
        --protocol tcp --port 3306 --source-group "$EC2_SG_ID"
    echo "  Created RDS SG: $DB_SG_ID"
else
    echo "  RDS SG exists: $DB_SG_ID"
fi

# --- 4. Create RDS MySQL Instance ---
echo "[4/8] Creating RDS MySQL instance (this takes 5-10 minutes)..."
DB_STATUS=$(aws rds describe-db-instances --db-instance-identifier "$DB_INSTANCE" \
    --region "$REGION" --query 'DBInstances[0].DBInstanceStatus' --output text 2>/dev/null || echo "not-found")

if [ "$DB_STATUS" = "not-found" ]; then
    aws rds create-db-instance \
        --db-instance-identifier "$DB_INSTANCE" \
        --db-instance-class "$DB_INSTANCE_CLASS" \
        --engine mysql \
        --engine-version "8.0" \
        --master-username "$DB_USER" \
        --master-user-password "$DB_PASS" \
        --allocated-storage 20 \
        --db-name "$DB_NAME" \
        --vpc-security-group-ids "$DB_SG_ID" \
        --backup-retention-period 0 \
        --no-multi-az \
        --no-auto-minor-version-upgrade \
        --publicly-accessible \
        --storage-type gp2 \
        --region "$REGION" > /dev/null
    echo "  RDS instance creating..."
else
    echo "  RDS instance already exists (status: $DB_STATUS)"
fi

# Wait for RDS to be available
echo "  Waiting for RDS to become available..."
aws rds wait db-instance-available --db-instance-identifier "$DB_INSTANCE" --region "$REGION"
DB_ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier "$DB_INSTANCE" \
    --region "$REGION" --query 'DBInstances[0].Endpoint.Address' --output text)
echo "  RDS endpoint: $DB_ENDPOINT"

# --- 5. Get latest Amazon Linux 2023 AMI ---
echo "[5/8] Finding AMI..."
AMI_ID=$(aws ec2 describe-images --owners amazon --region "$REGION" \
    --filters "Name=name,Values=al2023-ami-2023*-x86_64" "Name=state,Values=available" \
    --query 'sort_by(Images, &CreationDate)[-1].ImageId' --output text)
echo "  AMI: $AMI_ID"

# --- 6. Build the application ---
echo "[6/8] Building application..."
cd frontend
npm install --silent
npm run build
cd ../backend
./mvnw package -DskipTests -q
cd ..
JAR_PATH="backend/target/chess-arena-1.0.0.jar"
echo "  Built: $JAR_PATH"

# --- 7. Launch EC2 Instance ---
echo "[7/8] Launching EC2 instance..."

USER_DATA=$(cat <<'USERDATA'
#!/bin/bash
yum update -y
yum install -y java-17-amazon-corretto nginx

# Configure nginx as reverse proxy
cat > /etc/nginx/conf.d/chessarena.conf << 'NGINX'
server {
    listen 80;
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }
}
NGINX

# Remove default server block
sed -i '/server {/,/}/d' /etc/nginx/nginx.conf 2>/dev/null || true
systemctl enable nginx
systemctl start nginx
USERDATA
)

INSTANCE_ID=$(aws ec2 run-instances \
    --image-id "$AMI_ID" \
    --instance-type "$INSTANCE_TYPE" \
    --key-name "$KEY_NAME" \
    --security-group-ids "$EC2_SG_ID" \
    --user-data "$USER_DATA" \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$APP_NAME}]" \
    --region "$REGION" \
    --query 'Instances[0].InstanceId' --output text)
echo "  Instance: $INSTANCE_ID"

# Wait for instance to be running
echo "  Waiting for instance to start..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$REGION"

PUBLIC_IP=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" \
    --region "$REGION" --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
echo "  Public IP: $PUBLIC_IP"

# --- 8. Deploy JAR to EC2 ---
echo "[8/8] Deploying application to EC2..."
echo "  Waiting for SSH to be ready..."
sleep 30

# Copy JAR
scp -i "${KEY_NAME}.pem" -o StrictHostKeyChecking=no \
    "$JAR_PATH" ec2-user@${PUBLIC_IP}:/home/ec2-user/app.jar

# Create systemd service and start
ssh -i "${KEY_NAME}.pem" -o StrictHostKeyChecking=no ec2-user@${PUBLIC_IP} << REMOTE
sudo tee /etc/systemd/system/chessarena.service > /dev/null << 'SERVICE'
[Unit]
Description=ChessArena
After=network.target

[Service]
User=ec2-user
ExecStart=/usr/bin/java -jar /home/ec2-user/app.jar
Environment=DB_URL=jdbc:mysql://${DB_ENDPOINT}:3306/${DB_NAME}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
Environment=DB_USERNAME=${DB_USER}
Environment=DB_PASSWORD=${DB_PASS}
Environment=CORS_ORIGINS=http://${PUBLIC_IP}
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable chessarena
sudo systemctl start chessarena
REMOTE

echo ""
echo "============================================"
echo "  DEPLOYMENT COMPLETE!"
echo "============================================"
echo ""
echo "  App URL:      http://${PUBLIC_IP}"
echo "  SSH:          ssh -i ${KEY_NAME}.pem ec2-user@${PUBLIC_IP}"
echo "  DB Endpoint:  ${DB_ENDPOINT}"
echo ""
echo "  Note: App may take 30-60s to fully start."
echo "  Check status: ssh -i ${KEY_NAME}.pem ec2-user@${PUBLIC_IP} 'sudo systemctl status chessarena'"
echo "============================================"
