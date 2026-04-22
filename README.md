# Campus Hub

A full-stack campus social network with real-time direct messaging, built for students, faculty, and staff. Users can create posts, interact with peers, follow each other, and communicate instantly, all within a single campus-wide platform.

---

## Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | Authentication | Register, login, and logout securely with hashed credentials |
| 2 | User Profile | View and update personal info including name, bio, and department |
| 3 | Posts | Create, view, and delete posts on the campus-wide feed |
| 4 | Comments | Add, view, and delete comments on any post |
| 5 | Replies | Reply to existing comments in a nested thread structure |
| 6 | Voting | Upvote or downvote any post; change or remove your vote |
| 7 | Follow System | Follow and unfollow users; view followers and following lists |
| 8 | Direct Messaging | Send and receive real-time direct messages with any user |
| 9 | Search | Search for users by name or department |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (React) |
| Backend | FastAPI |
| Database | MySQL (aiomysql) |
| Real-time | WebSockets |

---

## Project Structure

```
campus-hub/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── websocket.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── posts.py
│   │   │   ├── comments.py
│   │   │   ├── replies.py
│   │   │   ├── votes.py
│   │   │   ├── follows.py
│   │   │   └── messages.py
│   │   ├── models/
│   │   └── utils/
│   │       └── auth.py
│   ├── schema.sql
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── feed/
│   │   ├── profile/[userId]/
│   │   ├── messages/[userId]/
│   │   └── search/
│   ├── components/
│   └── lib/
├── docs/
│   └── eer.pdf
├── .gitignore
└── README.md
```