-- =============================================================
-- Campus Hub — Seed Data
-- Run after schema.sql
-- =============================================================
USE campus_hub;
-- -------------------------------------------------------------
-- Department
-- -------------------------------------------------------------
INSERT INTO Department (DeptID, DeptCode, DeptName)
VALUES (1, 'CSE', 'Computer Science and Engineering'),
    (
        2,
        'EEE',
        'Electrical and Electronic Engineering'
    ),
    (3, 'BBA', 'Business Administration'),
    (4, 'ENG', 'English'),
    (5, 'PHY', 'Physics');
-- -------------------------------------------------------------
-- User (PwdHash is bcrypt hash of "password123")
-- -------------------------------------------------------------
INSERT INTO User (
        UserID,
        Username,
        Email,
        FirstName,
        LastName,
        Bio,
        JoinDate,
        PwdHash,
        DeptID
    )
VALUES (
        1,
        'alice',
        'alice@bracu.ac.bd',
        'Alice',
        'Rahman',
        'CSE major. Coffee-powered.',
        '2024-01-10 09:00:00',
        '$2b$12$KIXuBvh1Z8v1Q1Q1Q1Q1QeQ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q',
        1
    ),
    (
        2,
        'bob',
        'bob@bracu.ac.bd',
        'Bob',
        'Hossain',
        'Always down to study.',
        '2024-01-11 10:00:00',
        '$2b$12$KIXuBvh1Z8v1Q1Q1Q1Q1QeQ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q',
        1
    ),
    (
        3,
        'carol',
        'carol@bracu.ac.bd',
        'Carol',
        'Islam',
        'EEE student. Lab life.',
        '2024-01-12 11:00:00',
        '$2b$12$KIXuBvh1Z8v1Q1Q1Q1Q1QeQ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q',
        2
    ),
    (
        4,
        'david',
        'david@bracu.ac.bd',
        'David',
        'Khan',
        'Business by day, gamer by night.',
        '2024-01-13 12:00:00',
        '$2b$12$KIXuBvh1Z8v1Q1Q1Q1Q1QeQ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q',
        3
    ),
    (
        5,
        'eva',
        'eva@bracu.ac.bd',
        'Eva',
        'Chowdhury',
        'Love databases and memes.',
        '2024-01-14 13:00:00',
        '$2b$12$KIXuBvh1Z8v1Q1Q1Q1Q1QeQ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q',
        1
    ),
    (
        6,
        'farhan',
        'farhan@bracu.ac.bd',
        'Farhan',
        'Ahmed',
        'English lit fan. Chill vibes.',
        '2024-01-15 14:00:00',
        '$2b$12$KIXuBvh1Z8v1Q1Q1Q1Q1QeQ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q',
        4
    ),
    (
        7,
        'grace',
        'grace@bracu.ac.bd',
        'Grace',
        'Begum',
        'EEE club organizer.',
        '2024-01-16 15:00:00',
        '$2b$12$KIXuBvh1Z8v1Q1Q1Q1Q1QeQ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q',
        2
    ),
    (
        8,
        'hassan',
        'hassan@bracu.ac.bd',
        'Hassan',
        'Miah',
        'Physics nerd.',
        '2024-01-17 16:00:00',
        '$2b$12$KIXuBvh1Z8v1Q1Q1Q1Q1QeQ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q',
        5
    ),
    (
        9,
        'irene',
        'irene@bracu.ac.bd',
        'Irene',
        'Sultana',
        'Marketing major. Coffee explorer.',
        '2024-01-18 17:00:00',
        '$2b$12$KIXuBvh1Z8v1Q1Q1Q1Q1QeQ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q',
        3
    ),
    (
        10,
        'james',
        'james@bracu.ac.bd',
        'James',
        'Uddin',
        'AI enthusiast.',
        '2024-01-19 18:00:00',
        '$2b$12$KIXuBvh1Z8v1Q1Q1Q1Q1QeQ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q',
        1
    ),
    (
        11,
        'admin',
        'admin@bracu.ac.bd',
        'Admin',
        'User',
        'Platform admin.',
        '2024-01-01 08:00:00',
        '$2b$12$KIXuBvh1Z8v1Q1Q1Q1Q1QeQ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q',
        NULL
    ),
    (
        12,
        'mod',
        'mod@bracu.ac.bd',
        'Mod',
        'User',
        'Keeping the yard clean.',
        '2024-01-02 08:00:00',
        '$2b$12$KIXuBvh1Z8v1Q1Q1Q1Q1QeQ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q',
        1
    );
-- -------------------------------------------------------------
-- Admin
-- -------------------------------------------------------------
INSERT INTO Admin (UserID, Permissions)
VALUES (11, 'all');
-- -------------------------------------------------------------
-- Moderator
-- -------------------------------------------------------------
INSERT INTO Moderator (UserID)
VALUES (12);
-- -------------------------------------------------------------
-- Course
-- -------------------------------------------------------------
INSERT INTO Course (CourseID, CourseCode, CourseTitle, CreditHours)
VALUES (
        1,
        'CSE101',
        'Introduction to Computer Science',
        3
    ),
    (
        2,
        'CSE220',
        'Data Structures',
        3
    ),
    (
        3,
        'CSE330',
        'Algorithms',
        3
    ),
    (
        4,
        'EEE101',
        'Basic Electrical Engineering',
        3
    ),
    (
        5,
        'BBA101',
        'Principles of Management',
        3
    ),
    (
        6,
        'CSE470',
        'Artificial Intelligence',
        3
    ),
    (
        7,
        'CSE460',
        'Database Systems',
        3
    );
-- -------------------------------------------------------------
-- Enrolled_In
-- -------------------------------------------------------------
INSERT INTO Enrolled_In (UserID, CourseID, Semester, Year)
VALUES (1, 1, 'Spring', 2023),
    (1, 2, 'Summer', 2023),
    (1, 3, 'Fall', 2023),
    (1, 7, 'Spring', 2024),
    (2, 1, 'Spring', 2023),
    (2, 2, 'Summer', 2023),
    (2, 7, 'Spring', 2024),
    (3, 4, 'Spring', 2023),
    (4, 5, 'Spring', 2023),
    (5, 1, 'Spring', 2023),
    (5, 6, 'Fall', 2023),
    (7, 4, 'Spring', 2023),
    (8, 1, 'Spring', 2023),
    (10, 2, 'Summer', 2023),
    (10, 3, 'Fall', 2023);
-- -------------------------------------------------------------
-- Moderates
-- -------------------------------------------------------------
INSERT INTO Moderates (UserID, CourseID)
VALUES (12, 7),
    (12, 6);
-- -------------------------------------------------------------
-- Follows
-- -------------------------------------------------------------
INSERT INTO Follows (FollowerID, FolloweeID)
VALUES (1, 2),
    (1, 3),
    (1, 5),
    (2, 1),
    (2, 5),
    (3, 1),
    (4, 1),
    (5, 1),
    (5, 2),
    (6, 1),
    (7, 3),
    (8, 1),
    (9, 4),
    (10, 1),
    (10, 2);
-- -------------------------------------------------------------
-- Post
-- -------------------------------------------------------------
INSERT INTO Post (
        PostID,
        Content,
        Timestamp,
        VisibilityLevel,
        UserID
    )
VALUES (
        1,
        'Just finished my Data Structures assignment. Who else is struggling with AVL trees?',
        '2024-02-01 10:00:00',
        'public',
        1
    ),
    (
        2,
        'Anyone have notes from todays AI lecture? I missed it.',
        '2024-02-02 11:00:00',
        'public',
        2
    ),
    (
        3,
        'Looking for a study group for Database Systems. DM me if interested.',
        '2024-02-03 12:00:00',
        'public',
        5
    ),
    (
        4,
        'The campus cafeteria just got new menu items. The pasta is actually good.',
        '2024-02-04 13:00:00',
        'public',
        4
    ),
    (
        5,
        'Reminder: CSE470 midterm is next week. Start early.',
        '2024-02-05 14:00:00',
        'department',
        1
    ),
    (
        6,
        'Does anyone know if the library is open on Friday evening?',
        '2024-02-06 15:00:00',
        'public',
        6
    ),
    (
        7,
        'Just deployed my first FastAPI app. Feels amazing.',
        '2024-02-07 16:00:00',
        'public',
        10
    ),
    (
        8,
        'EEE lab report submission deadline extended to next Monday.',
        '2024-02-08 17:00:00',
        'department',
        3
    ),
    (
        9,
        'Tips for the upcoming thesis proposal? Any seniors who can help?',
        '2024-02-09 18:00:00',
        'public',
        9
    ),
    (
        10,
        'This is a private note to myself about project ideas.',
        '2024-02-10 19:00:00',
        'private',
        1
    );
-- -------------------------------------------------------------
-- Comment
-- -------------------------------------------------------------
INSERT INTO Comment (
        CommentID,
        ParentID,
        PostID,
        Content,
        Timestamp,
        UserID
    )
VALUES -- Comments on Post 1
    (
        1,
        NULL,
        1,
        'AVL trees broke me too. The rotation logic is brutal.',
        '2024-02-01 10:30:00',
        2
    ),
    (
        2,
        NULL,
        1,
        'Check out Visualgo.net, it animates the rotations really well.',
        '2024-02-01 10:45:00',
        5
    ),
    (
        3,
        NULL,
        1,
        'I can help you out, I took this course last semester.',
        '2024-02-01 11:00:00',
        10
    ),
    -- Reply to Comment 1
    (
        4,
        1,
        1,
        'Right? Double rotations especially. How did you get through it?',
        '2024-02-01 11:15:00',
        1
    ),
    -- Reply to Comment 4
    (
        5,
        4,
        1,
        'I just drew it out on paper every single time until it clicked.',
        '2024-02-01 11:30:00',
        2
    ),
    -- Comments on Post 2
    (
        6,
        NULL,
        2,
        'I have notes, will share in the group chat later.',
        '2024-02-02 11:30:00',
        1
    ),
    (
        7,
        NULL,
        2,
        'The lecture was about Bayesian Networks. Important for the midterm.',
        '2024-02-02 12:00:00',
        5
    ),
    -- Reply to Comment 6
    (
        8,
        6,
        2,
        'Thanks! Really appreciate it.',
        '2024-02-02 12:15:00',
        2
    ),
    -- Comments on Post 3
    (
        9,
        NULL,
        3,
        'I am in! When are you thinking of meeting?',
        '2024-02-03 12:30:00',
        2
    ),
    (
        10,
        NULL,
        3,
        'Count me in too. Maybe Saturday afternoon?',
        '2024-02-03 13:00:00',
        10
    ),
    -- Reply to Comment 9
    (
        11,
        9,
        3,
        'Saturday works for me. Library study room?',
        '2024-02-03 13:15:00',
        5
    ),
    -- Comments on Post 7
    (
        12,
        NULL,
        7,
        'Which tutorial did you follow? I want to learn FastAPI too.',
        '2024-02-07 16:30:00',
        1
    ),
    (
        13,
        NULL,
        7,
        'FastAPI is great. The async support is really clean.',
        '2024-02-07 17:00:00',
        5
    ),
    -- Reply to Comment 12
    (
        14,
        12,
        7,
        'I used the official FastAPI docs mostly. Very beginner friendly.',
        '2024-02-07 17:15:00',
        10
    );
-- -------------------------------------------------------------
-- Message
-- -------------------------------------------------------------
INSERT INTO Message (
        MessageID,
        SenderID,
        ReceiverID,
        Content,
        Timestamp
    )
VALUES (
        1,
        1,
        2,
        'Hey Bob, did you finish the algorithms assignment?',
        '2024-02-05 09:00:00'
    ),
    (
        2,
        2,
        1,
        'Not yet, stuck on the dynamic programming part. You?',
        '2024-02-05 09:05:00'
    ),
    (
        3,
        1,
        2,
        'Same. Want to work on it together tonight?',
        '2024-02-05 09:10:00'
    ),
    (
        4,
        2,
        1,
        'Sure, library at 7pm?',
        '2024-02-05 09:12:00'
    ),
    (
        5,
        1,
        2,
        'Perfect, see you there.',
        '2024-02-05 09:13:00'
    ),
    (
        6,
        5,
        1,
        'Alice, are you joining the database study group?',
        '2024-02-06 10:00:00'
    ),
    (
        7,
        1,
        5,
        'Yes! Saturday at the library right?',
        '2024-02-06 10:05:00'
    ),
    (
        8,
        5,
        1,
        'Exactly. Bring your ER diagram notes.',
        '2024-02-06 10:07:00'
    ),
    (
        9,
        10,
        2,
        'Bob do you have the slide deck from last weeks lecture?',
        '2024-02-07 14:00:00'
    ),
    (
        10,
        2,
        10,
        'Yes I will send it over now.',
        '2024-02-07 14:03:00'
    );
-- -------------------------------------------------------------
-- Votes_On_Post
-- -------------------------------------------------------------
INSERT INTO Votes_On_Post (UserID, PostID, VoteType, Timestamp)
VALUES (2, 1, 'upvote', '2024-02-01 10:35:00'),
    (3, 1, 'upvote', '2024-02-01 10:40:00'),
    (4, 1, 'upvote', '2024-02-01 11:00:00'),
    (5, 1, 'upvote', '2024-02-01 11:05:00'),
    (1, 2, 'upvote', '2024-02-02 11:35:00'),
    (3, 2, 'upvote', '2024-02-02 12:00:00'),
    (6, 2, 'downvote', '2024-02-02 12:30:00'),
    (1, 3, 'upvote', '2024-02-03 12:35:00'),
    (2, 3, 'upvote', '2024-02-03 13:00:00'),
    (4, 3, 'upvote', '2024-02-03 13:30:00'),
    (1, 4, 'upvote', '2024-02-04 13:30:00'),
    (2, 4, 'downvote', '2024-02-04 14:00:00'),
    (3, 4, 'downvote', '2024-02-04 14:30:00'),
    (1, 7, 'upvote', '2024-02-07 16:35:00'),
    (2, 7, 'upvote', '2024-02-07 17:00:00'),
    (3, 7, 'upvote', '2024-02-07 17:30:00'),
    (4, 7, 'upvote', '2024-02-07 18:00:00'),
    (6, 9, 'upvote', '2024-02-09 18:30:00'),
    (7, 9, 'upvote', '2024-02-09 19:00:00'),
    (8, 9, 'upvote', '2024-02-09 19:30:00');