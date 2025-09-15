# 📋 Guide d'utilisation - Gestion de profil utilisateur

## 🎯 Vue d'ensemble

Le système de gestion de profil utilisateur permet aux utilisateurs de modifier toutes leurs informations personnelles de A à Z. Il s'agit d'une interface complète et moderne avec une navigation par onglets.

## 🚀 Fonctionnalités

### 📝 **Onglet Profil**
- **Photo de profil** : URL d'avatar avec aperçu en temps réel
- **Informations personnelles** :
  - Nom d'utilisateur (obligatoire)
  - Email (obligatoire)
  - Nom complet
  - Téléphone
  - Adresse
  - Biographie
- **Informations du compte** (lecture seule) :
  - Rôle (admin/user)
  - Statut (active/blocked/pending)
  - Date d'inscription
  - Dernière connexion

### 🔒 **Onglet Sécurité**
- **Changement de mot de passe** :
  - Mot de passe actuel (obligatoire)
  - Nouveau mot de passe (minimum 6 caractères)
  - Confirmation du nouveau mot de passe
  - Boutons d'affichage/masquage des mots de passe

### ⚠️ **Onglet Zone de danger**
- **Suppression de compte** :
  - Confirmation par mot de passe
  - Confirmation par saisie de "SUPPRIMER"
  - Suppression définitive de toutes les données

## 🛠️ Installation et configuration

### 1. **Mise à jour de la base de données**

Exécutez le script SQL pour ajouter les nouveaux champs :

```bash
# Se connecter à MySQL
mysql -u root -p pigeon_farm

# Exécuter le script
source backend/update-users-profile-fields.sql
```

### 2. **Nouveaux champs ajoutés**
```sql
ALTER TABLE users 
ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL,
ADD COLUMN phone VARCHAR(20) DEFAULT NULL,
ADD COLUMN address TEXT DEFAULT NULL,
ADD COLUMN bio TEXT DEFAULT NULL;
```

### 3. **Routes API disponibles**

#### **Profil utilisateur**
- `GET /api/users/profile/me` - Récupérer le profil
- `PUT /api/users/profile/me` - Mettre à jour le profil
- `PUT /api/users/profile/me/password` - Changer le mot de passe
- `PUT /api/users/profile/me/avatar` - Mettre à jour l'avatar
- `DELETE /api/users/profile/me` - Supprimer le compte

## 🎨 Interface utilisateur

### **Design moderne**
- Interface responsive (mobile/desktop)
- Navigation par onglets intuitive
- Messages d'état avec icônes
- Validation en temps réel
- Boutons d'action avec icônes Lucide

### **Expérience utilisateur**
- **Sauvegarde automatique** en localStorage
- **Validation côté client** et serveur
- **Messages d'erreur** clairs et contextuels
- **États de chargement** pour toutes les actions
- **Confirmation** pour les actions dangereuses

## 🔧 Utilisation technique

### **Composant Profile.tsx**
```typescript
interface ProfileProps {
  user: UserType;
  onUpdate: (user: UserType) => void;
}
```

### **Types TypeScript étendus**
```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  bio?: string;
  // ... autres champs
}
```

### **Méthodes API**
```typescript
// Mettre à jour le profil
const response = await apiService.put('/users/profile/me', {
  username: 'nouveau_username',
  email: 'nouveau@email.com',
  full_name: 'Nom Complet',
  phone: '+33123456789',
  address: '123 Rue Example',
  bio: 'Ma biographie...'
});

// Changer le mot de passe
const response = await apiService.put('/users/profile/me/password', {
  currentPassword: 'ancien_mot_de_passe',
  newPassword: 'nouveau_mot_de_passe'
});
```

## 🛡️ Sécurité

### **Validation des données**
- **Côté client** : Validation en temps réel
- **Côté serveur** : Validation stricte des entrées
- **Authentification** : Vérification du token JWT
- **Autorisation** : Seul l'utilisateur peut modifier son profil

### **Protection des mots de passe**
- **Hachage bcrypt** avec salt rounds 12
- **Vérification** du mot de passe actuel
- **Validation** de la force du nouveau mot de passe
- **Confirmation** obligatoire pour les changements

### **Suppression de compte**
- **Double confirmation** : mot de passe + texte "SUPPRIMER"
- **Suppression en cascade** de toutes les données liées
- **Transaction atomique** pour garantir la cohérence

## 📱 Responsive design

### **Mobile (< 768px)**
- Navigation par onglets adaptée
- Formulaires en colonne unique
- Boutons pleine largeur
- Texte et espacement optimisés

### **Tablet (768px - 1024px)**
- Grilles adaptatives
- Espacement équilibré
- Navigation optimisée

### **Desktop (> 1024px)**
- Interface complète
- Grilles multi-colonnes
- Espacement généreux
- Navigation latérale possible

## 🎯 Intégration dans l'application

### **Dans App.tsx ou le composant principal**
```typescript
import Profile from './components/Profile';

// Dans le rendu
<Profile 
  user={currentUser} 
  onUpdate={(updatedUser) => {
    setCurrentUser(updatedUser);
    // Mise à jour du contexte global si nécessaire
  }} 
/>
```

### **Navigation**
Ajoutez un lien vers le profil dans votre navigation :
```typescript
<Link to="/profile" className="nav-link">
  <User className="h-4 w-4" />
  Mon Profil
</Link>
```

## 🔍 Débogage

### **Logs utiles**
- Vérifiez les logs du serveur pour les erreurs API
- Inspectez les requêtes réseau dans les DevTools
- Vérifiez la structure de la base de données

### **Tests courants**
1. **Mise à jour du profil** avec des données valides
2. **Changement de mot de passe** avec l'ancien mot de passe correct
3. **Upload d'avatar** avec une URL valide
4. **Validation** avec des données invalides
5. **Suppression de compte** avec confirmation correcte

## 🚀 Améliorations futures possibles

- **Upload de fichiers** pour l'avatar (au lieu d'URL)
- **Thème sombre/clair** dans les préférences
- **Notifications** par email pour les changements
- **Historique** des modifications du profil
- **Préférences** de langue et de région
- **Authentification à deux facteurs**

---

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs du serveur
2. Consultez la documentation des APIs
3. Testez avec des données de base
4. Vérifiez la structure de la base de données

**La gestion de profil est maintenant complètement fonctionnelle ! 🎉**
