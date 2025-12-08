# TaskFlow – Application de Gestion de Projets (MVP)

TaskFlow est une application web de gestion de projets et de tâches développée dans le cadre d’un projet universitaire par une équipe de 5 étudiants sur une durée de 8 semaines.  
L’objectif principal était de construire un **MVP (Minimum Viable Product)** fonctionnel permettant aux utilisateurs de créer des projets, gérer des tâches et visualiser leur progression via un tableau Kanban clair et intuitif.

Ce MVP constitue la première étape du projet. D’autres fonctionnalités avancées seront ajoutées dans les futures itérations.

---

# 1.  Vision du Projet

TaskFlow a été conçu pour offrir une solution simple, efficace et moderne permettant :

- de structurer le travail au sein de projets,
- de visualiser rapidement la progression,
- de centraliser les tâches et informations importantes,
- de faciliter à terme la **collaboration en équipe**.

La version actuelle (MVP) couvre toutes les fonctionnalités essentielles d’un outil de gestion de projets.  
Les fonctionnalités collaboratives multi-utilisateurs seront intégrées dans les versions futures.

---

# 2.  Fonctionnalités (MVP)

### ✔ Gestion des utilisateurs
- Création de compte
- Connexion & authentification sécurisée (JWT)
- Récupération du profil utilisateur

### ✔ Gestion des projets
- Création et suppression de projets
- Consultation des informations d’un projet
- Visualisation du tableau de bord

### ✔ Gestion des tâches
- Ajout, modification et suppression de tâches
- Attribution d’un statut :  
  - À faire  
  - En cours  
  - Terminé
- Mise à jour automatique de la progression du projet

### ✔ Tableau Kanban interactif
- Organisation des tâches par colonnes
- Mise à jour dynamique

### ✔ Interface moderne
- UX épurée
- Animations fluides (Framer Motion)
- Responsive

> 🔧 *Toutes ces fonctionnalités composent le MVP valide, stable et présentable.*

---

# 3.  Fonctionnalités prévues (Post-MVP)

La version finale du projet intégrera :

- Collaboration en temps réel entre plusieurs utilisateurs
- Éditeur avancé de tâches
- Gestion des équipes et rôles
- Commentaires et journal d’activité
- Drag-and-drop natif sur le Kanban
- Notifications en temps réel
- Filtres & recherche avancés
- Intégration de fichiers et pièces jointes

---

# 4.  Architecture Technique

### **Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- Axios (requêtes API)
- Framer Motion (animations)

### **Backend**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy (ORM)
- Redis (cache)
- JWT (authentification)
- Uvicorn (serveur)
- Alembic (migrations futures)

### **Outils & Environnement**
- Docker / Docker Compose
- Git & GitHub
- VSCode
- Méthodologie Scrum

---

# 5.  Méthodologie de Développement – Scrum

Le projet a été réalisé selon les principes Scrum :

### **Équipe**
- 5 développeurs  
- Rôles répartis : Product Owner, Scrum Master, Développeurs

### **Organisation**
- Durée : 8 semaines  
- Sprints : 1 sprint par 3 semaine  
- Rituels :
  - Sprint Planning
  - Daily Meetings
  - Sprint Review
  - Rétrospectives

### **Outils de gestion**
- Notion 
- Issues & Pull Requests
- Jira

---

# 6.  Installation & Lancement

### Cloner le projet
```bash
git clone <repository-url>
cd taskflow
Lancer l'application via Docker
bash
Copier le code
docker compose up --build
Services démarrés :

Frontend : http://localhost:5173

Backend : http://localhost:8000

Documentation API : http://localhost:8000/docs

7.  Structure minimaliste du Projet

taskflow/
├── backend/
│   ├── app/
│   ├── Dockerfile
│   ├── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   ├── Dockerfile
│
├── docker-compose.yml
└── README.md
8. 📌 Endpoints API Principaux
Authentification
POST /users/register

POST /users/login

GET /users/me

Projets
GET /projects/

POST /projects/

DELETE /projects/{id}

Tâches
GET /tasks/project/{project_id}

POST /tasks/

PUT /tasks/{id}

DELETE /tasks/{id}

9.  Évolutions futures
Le projet suivra une roadmap continue comprenant :

intégration de WebSockets,

refonte collaborative du Kanban,

ajout d’un espace équipe,

tableau d’activité,

mode sombre,

optimisation des performances.

10.  Contributions
Les contributions sont encouragées.
Veuillez créer une branche dédiée, ouvrir une Pull Request et décrire clairement vos modifications.

