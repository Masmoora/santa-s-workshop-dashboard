🎅 SantaGifts – Christmas Wish Management Web App

📌 Project Description

SantaGifts is a Christmas-themed web application designed to digitally manage Santa’s gift delivery process.
The platform connects Children, Santa (Admin), and Elves in a structured workflow where children can submit wishes and letters, Santa can manage and assign tasks, and Elves can deliver gifts.

This project modernizes the traditional Christmas process by introducing role-based dashboards, wish tracking, letter communication, and delivery management - all in one festive application.

## ✨ Features

### 👶 Child Features
- Secure signup and login  
- Add and update delivery address  
- Submit Christmas wish list  
- View wish status (Pending / Assigned / Delivered)  
- Write letters to Santa  
- View Santa’s replies  
- Personalized dashboard with activity summary  

---

🎅 Santa (Admin) Features

• Secure admin login (no public signup)
• Dashboard overview:
Total children
Total wishes
Pending / Assigned / Delivered wishes
Total letters
Total elves
• View all registered children and their details
• View children’s delivery addresses
• Read and reply to children’s letters
• View all wishes with child and address details
• Assign wishes to specific Elves
• Track wish delivery status
Manage Elves:
• View Elf name and email
• View assigned wishes count
• View completed wishes count

🧝 Elf Features

• Secure signup and login
• View assigned wishes
• View child delivery address
• Update wish status to Delivered
• Track completed deliveries

🛠 Tech Stack Used

Frontend:

React 18 + TypeScript
Vite
React Router DOM
TanStack React Query
React Hook Form + Zod
Tailwind CSS + shadcn/ui
Lucide Icons

Backend:

Lovable Cloud (Supabase)
PostgreSQL
Supabase Authentication
Row Level Security (RLS)

🔐 Authentication & Roles

Secure login using Supabase Auth
Role-based routing and protected pages
Roles: child, santa, elf
Permissions handled using database policies

📦 Setup Instructions

Clone the repository

Install dependencies

npm install

Add environment variables:

VITE_SUPABASE_URL

VITE_SUPABASE_PUBLISHABLE_KEY

Start the app:

npm run dev

##📸 Screenshots:

Home / Landing Page:
<img width="1904" height="947" alt="Screenshot 2025-12-30 130222" src="https://github.com/user-attachments/assets/09868f97-73b5-443d-acac-af2fb645826b" />

Login Page:
<img width="1063" height="902" alt="Screenshot 2025-12-30 130257" src="https://github.com/user-attachments/assets/f22259c5-4bfe-4b65-928f-572b87a5159c" />

Signup Page:
<img width="1456" height="947" alt="Screenshot 2025-12-30 130318" src="https://github.com/user-attachments/assets/233a3ad5-aaaa-41d6-8f74-f4550fefa741" />

Santa Dashboard Page:
<img width="1905" height="947" alt="Screenshot 2025-12-30 130357" src="https://github.com/user-attachments/assets/06206fc1-960d-4d35-aaf2-7fa779d96442" />

<img width="1919" height="928" alt="Screenshot 2025-12-30 130424" src="https://github.com/user-attachments/assets/3404ed83-4b25-49fd-bace-f737482a6b72" />

<img width="1910" height="924" alt="Screenshot 2025-12-30 130507" src="https://github.com/user-attachments/assets/4f51e577-a32e-42d5-9cbb-db18e523fb5b" />

<img width="1919" height="950" alt="Screenshot 2025-12-30 130522" src="https://github.com/user-attachments/assets/206a0482-3f6e-4199-95e6-c19fc3ffb76f" />

<img width="1912" height="934" alt="Screenshot 2025-12-30 130554" src="https://github.com/user-attachments/assets/de45c590-a644-4387-ad4a-e5d01d481e5c" />

Child Dashboard Page:
<img width="1909" height="994" alt="Screenshot 2025-12-30 130628" src="https://github.com/user-attachments/assets/7f9563bb-4d8f-419c-beed-516f1a793e71" />

<img width="1919" height="919" alt="Screenshot 2025-12-30 130648" src="https://github.com/user-attachments/assets/4784bbc7-4176-4421-81b2-1a918b8e38d8" />

<img width="1919" height="950" alt="Screenshot 2025-12-30 130706" src="https://github.com/user-attachments/assets/41fe7880-0644-4be8-beba-d1386f45b2d7" />

<img width="1918" height="940" alt="Screenshot 2025-12-30 130717" src="https://github.com/user-attachments/assets/9d9a9605-e4cc-4742-9908-f50a9068446b" />

Elf Dashboard Page:
<img width="1919" height="983" alt="Screenshot 2025-12-30 130830" src="https://github.com/user-attachments/assets/652bd522-09c5-4d41-ba0c-484354e402af" />





