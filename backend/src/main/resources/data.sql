INSERT INTO puzzle (fen, solution_moves, rating, category, title, description, times_attempted, times_solved) VALUES
('r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4','f3g5',1200,'FORK','Knight Fork','Find the fork!',0,0),
('6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1','e1e8',1000,'MATING_NET','Back Rank Mate','Deliver checkmate in 1!',0,0),
('r2qkb1r/ppp2ppp/2np1n2/1B2p3/3PP3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 6','b5c6',1300,'PIN','Absolute Pin','Use the pin to win!',0,0),
('8/8/8/3k4/8/3K4/8/3R4 w - - 0 1','d1d5',900,'ENDGAME','Rook Endgame','Use the rook to force mate!',0,0),
('r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 2 5','c4f7',1500,'TACTICS','Fried Liver','Sacrifice the bishop!',0,0),
('4k3/8/4K3/4R3/8/8/8/8 w - - 0 1','e5e8',800,'MATING_NET','Rook Mate','Checkmate in 1!',0,0),
('8/8/3k4/8/3K4/8/8/4Q3 w - - 0 1','e1e6',850,'MATING_NET','Queen and King','Force checkmate!',0,0),
('r1bq1rk1/pppp1ppp/2n2n2/2b1p3/1PB1P3/P1N2N2/2PP1PPP/R1BQK2R w KQ - 0 7','c4b5',1250,'TACTICS','Bishop Pressure','Apply pressure!',0,0),
('6k1/8/6K1/6R1/8/8/8/8 w - - 0 1','g5g8',900,'MATING_NET','Rook Checkmate','Mate in 1!',0,0),
('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPPBPPP/RNBQK2R w KQkq - 2 3','e2b5',1150,'PIN','Spanish Opening','Find the pin!',0,0),
('8/p7/8/KP6/6pk/8/8/8 w - - 0 1','b5b6',1400,'ENDGAME','Passed Pawn','Promote the pawn!',0,0),
('8/8/8/4k3/4P3/4K3/8/8 w - - 0 1','e3d3',1100,'ENDGAME','King Opposition','Use opposition!',0,0),
('r3r1k1/pp3ppp/2p2n2/4p3/2B5/1B3N2/PP3PPP/R4RK1 w - - 0 15','c4f7',1650,'TACTICS','Double Bishop','Sac for the win!',0,0),
('r4rk1/1pp2ppp/p1np1n2/2b1p1B1/2B1P3/3P1N2/PPP2PPP/R2QR1K1 w - - 0 10','c4f7',1800,'TACTICS','Bishop Sacrifice','Sac on f7!',0,0),
('8/7k/8/6KR/8/8/8/8 w - - 0 1','h5h7',1050,'MATING_NET','Drive the King','Drive the king to the edge!',0,0),
('6k1/6pp/8/8/8/8/6PP/5RK1 w - - 0 1','f1f8',950,'MATING_NET','Ladder Mate','Checkmate!',0,0),
('r1b1kb1r/ppppqppp/2n2n2/4p3/2B1P3/5N2/PPPPQPPP/RNB1K2R w KQkq - 4 5','c4f7',1700,'TACTICS','Double Check','Find the combination!',0,0),
('r2q1rk1/ppp2ppp/2np1n2/2b1p3/2B1P1b1/2NP1N2/PPP2PPP/R1BQR1K1 w - - 0 8','c4f7',1900,'TACTICS','Complex Combo','Find the win!',0,0),
('r3k2r/ppp2ppp/2n1bn2/3qp3/3P4/2PB1N2/PP3PPP/R1BQR1K1 w kq - 0 10','d3h7',1600,'TACTICS','Attack the King','Attack the king!',0,0),
('r1b1r1k1/pp3ppp/2p2n2/3p4/3P1B2/2N2N2/PP3PPP/R3R1K1 w - - 0 12','f4h6',1350,'TACTICS','Bishop Attack','Find the bishop move!',0,0),
-- Knight Fork: Knight attacks two pieces simultaneously
('r1bqk2r/pppp1ppp/2n2n2/4N3/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 5','e5f7',1250,'KNIGHT_FORK','Royal Fork','The knight attacks king and queen simultaneously!',0,0),
-- Absolute Pin: Piece cannot move because king is behind it
('r1bqk2r/pppp1Bpp/2n2n2/4p3/4P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 4','e8f7',1100,'ABSOLUTE_PIN','Pinned to the King','The piece is pinned to the king and cannot move!',0,0),
-- Skewer: Attack a valuable piece forcing it to move, exposing a piece behind
('6k1/8/8/8/8/8/1K6/r5R1 w - - 0 1','g1g8',1200,'SKEWER','Rook Skewer','Attack the king to win the rook behind it!',0,0),
-- Discovered Attack: Moving one piece reveals an attack by another
('r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 5','d2d4',1350,'DISCOVERED_ATTACK','Discover the Bishop','Move the pawn to reveal the bishop attack!',0,0),
-- Back Rank: Checkmate on the back rank
('6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1','a1a8',1000,'BACK_RANK','Back Rank Mate','The king is trapped by its own pawns!',0,0),
-- Double Check: Two pieces give check simultaneously
('r1bqk2r/pppp1Npp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 5','e8e7',1400,'DOUBLE_CHECK','Double Check','Two pieces attack the king — only the king can move!',0,0),
-- Decoy: Lure a piece to a bad square
('8/8/8/8/8/5k2/4p3/4K1R1 w - - 0 1','g1f1',1300,'DECOY','Decoy the King','Lure the enemy piece to a vulnerable square!',0,0),
-- Attraction: Force a piece to a specific square
('6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1','e1e8',1150,'ATTRACTION','Attract to Mate','Force the piece to a square where it can be exploited!',0,0),
-- Smothered Mate: Knight checkmates a king surrounded by its own pieces
('6rk/6pp/8/8/8/8/8/R3K1N1 w - - 0 1','g1f3',1500,'SMOTHERED_MATE','Smothered Mate','The king is trapped by its own pieces — knight delivers mate!',0,0),
-- King Extraction: Force the king into the open
('r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4','c4f7',1600,'KING_EXTRACTION','Extract the King','Sacrifice to drag the king into the open!',0,0),
-- Greek Gift: Classic Bxh7+ sacrifice
('r1bq1rk1/pppn1ppp/4pn2/3p4/1bBP4/2N1PN2/PPP2PPP/R1BQ1RK1 w - - 0 7','c4h7',1700,'GREEK_GIFT','Greek Gift Sacrifice','The classic Bxh7+ sacrifice to expose the king!',0,0),
-- Removing the Defender: Capture or deflect the piece that guards a key square
('r2qk2r/ppp2ppp/2n1bn2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 6','c4e6',1400,'REMOVING_THE_DEFENDER','Remove the Guard','Eliminate the piece that defends the key square!',0,0),
-- X-Ray: A piece controls a square through another piece
('8/8/8/4k3/8/8/4R3/4K3 w - - 0 1','e2e5',1100,'X_RAY','X-Ray Attack','Control squares through other pieces!',0,0),
-- Trapped Piece: A piece has no safe squares to move to
('r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 3','d2d4',1300,'TRAPPED_PIECE','Trap the Piece','The piece has nowhere to go — win it!',0,0),
-- Windmill: Repeated discovered checks winning material
('1r4k1/5ppp/8/8/1B6/8/5PPP/3R2K1 w - - 0 1','d1d8',1800,'WINDMILL','Windmill Attack','Use repeated discovered attacks to win material!',0,0),
-- Counter Threat: Instead of defending, create a bigger threat
('r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4','f3e5',1250,'COUNTER_THREAT','Counter Attack','Instead of defending, create a bigger threat!',0,0),
-- Zwischenzug: An intermediate move inserted before the expected move
('r2qkb1r/ppp2ppp/2n1bn2/3Np3/2B1P3/8/PPPP1PPP/R1BQK2R w KQkq - 0 6','d5f6',1500,'ZWISCHENZUG','In-Between Move','Insert a surprising intermediate move before recapturing!',0,0),
-- Zugzwang: The opponent is forced to make a move that worsens their position
('8/8/8/3k4/3P4/3K4/8/8 w - - 0 1','d3c3',1400,'ZUGZWANG','Zugzwang','Force your opponent into a position where any move loses!',0,0),
-- Simplification: Trade pieces to reach a winning endgame
('3r2k1/5ppp/8/3R4/8/8/5PPP/6K1 w - - 0 1','d5d8',1200,'SIMPLIFICATION','Simplify to Win','Trade pieces to reach a winning endgame!',0,0),
-- Stalemate: Use stalemate as a defensive resource
('7k/8/6K1/8/8/8/8/6Q1 w - - 0 1','g1g7',900,'STALEMATE','Avoid Stalemate','Be careful not to stalemate — keep the opponent a legal move!',0,0),
-- Linear Mate: Two rooks or queen+rook deliver mate by cutting off ranks
('6k1/8/8/8/8/8/8/R3RK2 w - - 0 1','e1e8',950,'LINEAR_MATE','Linear Mate','Use two rooks to deliver checkmate rank by rank!',0,0),
-- Sacrifice: Give up material for a greater advantage
('r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4','c4f7',1500,'SACRIFICE','Sacrifice for Attack','Give up material to gain a decisive attack!',0,0),
-- Deflection: Force a defending piece away from its duty
('r2q1rk1/ppp2ppp/3b1n2/3Pp3/8/2N5/PPP2PPP/R1BQR1K1 w - - 0 10','d5d6',1450,'DEFLECTION','Deflect the Defender','Force the defending piece away from its key duty!',0,0),
-- Interference: Place a piece between an attacker and defender
('r4rk1/ppp2ppp/2n1b3/3q4/3P4/2N1B3/PPP2PPP/R2QR1K1 w - - 0 12','e3c5',1550,'INTERFERENCE','Block the Connection','Place a piece to cut the line between enemy pieces!',0,0),
-- Clearance: Move a piece out of the way to open a line
('r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4','d4d5',1200,'CLEARANCE','Clear the Path','Move a piece to open a line for another!',0,0),
-- Overloading: A piece has too many defensive duties
('r2q1rk1/ppp2ppp/2nb1n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQR1K1 w - - 0 8','c4d5',1400,'OVERLOADING','Overload the Defender','The defender has too many jobs — exploit it!',0,0);