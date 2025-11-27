# 📍 Guide Complet - Où Vont les Sauvegardes ?

## 🎯 Réponse Rapide

**Il y a 2 types de sauvegardes :**

1. **📥 Sauvegarde LOCALE** : Sur votre ordinateur (dans Téléchargements)
2. **🖥️ Sauvegarde SERVEUR** : Sur le serveur (backend/backups)

---

## 📦 1. SAUVEGARDE LOCALE (Téléchargement)

### 📍 Emplacement
```
C:\Users\VotreNom\Downloads\
  └── pigeon-farm-backup-2025-10-27.json
```

### 🎯 Comment ça marche ?

Quand vous cliquez sur **"Exporter mes données"** :
1. ✅ Vos données sont récupérées depuis la base de données
2. ✅ Un fichier JSON est créé
3. ✅ Le navigateur **télécharge** le fichier
4. ✅ Le fichier arrive dans votre dossier **Téléchargements**

### ✨ Avantages
- ✅ **Contrôle total** : C'est VOTRE fichier
- ✅ **Portable** : Vous pouvez le déplacer, copier, envoyer
- ✅ **Sécurisé** : Stocké sur votre PC, pas sur le serveur
- ✅ **Hors ligne** : Pas besoin d'internet pour y accéder

### 📝 Exemple d'utilisation
```typescript
// Dans l'application frontend
await exportUserData();
// → Télécharge : pigeon-farm-backup-2025-10-27.json
```

---

## 🖥️ 2. SAUVEGARDE SERVEUR

### 📍 Emplacement par défaut
```
📁 Pigeon-Farm/
  └── 📁 backend/
      └── 📁 backups/
          ├── 📄 backup_user1_2025-10-27T14-30-00-000Z.json
          ├── 📄 backup_user1_2025-10-20T10-15-30-000Z.json
          ├── 📄 backup_user2_2025-10-26T08-45-12-000Z.json
          └── 📄 README.md
```

**Chemin complet :**
```
C:\Users\dabad\Desktop\Pigeon-Farm\backend\backups\
```

### 🎯 Comment ça marche ?

Quand vous cliquez sur **"Sauvegarder sur serveur"** :
1. ✅ Vos données sont récupérées depuis la base de données
2. ✅ Un fichier JSON est créé sur le SERVEUR
3. ✅ Le fichier est stocké dans `backend/backups/`
4. ✅ Vous recevez une confirmation

### ✨ Avantages
- ✅ **Automatique** : Peut être programmé (cron job)
- ✅ **Centralisé** : Toutes les sauvegardes au même endroit
- ✅ **Historique** : Plusieurs versions conservées
- ✅ **Restauration rapide** : Depuis l'interface

### 📝 Exemple d'utilisation
```typescript
// Dans l'application frontend
await saveBackupToServer();
// → Crée : backend/backups/backup_user1_2025-10-27T14-30-00-000Z.json
```

---

## 🔧 PERSONNALISER L'EMPLACEMENT

### Option 1️⃣ : Modifier la configuration

Ouvrez le fichier `backend/config/backup-config.js` :

```javascript
// OPTION 1 : Dossier backend/backups (PAR DÉFAUT)
const defaultBackupDir = path.join(__dirname, '../backups');

// OPTION 2 : Dossier Documents Windows
const documentsBackupDir = path.join(
  os.homedir(), 
  'Documents', 
  'PigeonFarm-Backups'
);
// → C:\Users\VotreNom\Documents\PigeonFarm-Backups\

// OPTION 3 : Disque externe
const externalBackupDir = 'D:\\Sauvegardes\\PigeonFarm';
// → D:\Sauvegardes\PigeonFarm\

// OPTION 4 : Dossier réseau
const networkBackupDir = '\\\\SERVEUR\\Partages\\PigeonFarm-Backups';
// → \\SERVEUR\Partages\PigeonFarm-Backups\
```

### Puis activez l'option souhaitée :

```javascript
// 👇 CHOISISSEZ ICI
const activeBackupDir = documentsBackupDir;  // Documents Windows
// OU
const activeBackupDir = externalBackupDir;   // Disque D:
// OU
const activeBackupDir = networkBackupDir;    // Réseau
```

### Option 2️⃣ : Dossiers séparés par utilisateur

```javascript
// Dans backup-config.js
const backupOptions = {
  separateUserFolders: true,  // ← Activez ceci
};
```

**Résultat :**
```
📁 backups/
  ├── 📁 user_1/
  │   ├── backup_user1_2025-10-27.json
  │   └── backup_user1_2025-10-20.json
  ├── 📁 user_2/
  │   └── backup_user2_2025-10-26.json
  └── 📁 user_3/
      └── backup_user3_2025-10-25.json
```

---

## 📋 STRUCTURE D'UNE SAUVEGARDE

Voici ce qui est contenu dans chaque fichier JSON :

```json
{
  "metadata": {
    "version": "1.0",
    "exportDate": "2025-10-27T14:30:00.000Z",
    "userId": 1,
    "username": "john_doe"
  },
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user"
  },
  "couples": [
    {
      "id": 1,
      "nestNumber": "Nid 1",
      "race": "Mondain",
      "maleId": "M001",
      "femaleId": "F001",
      "formationDate": "2025-01-15",
      "status": "active"
    }
  ],
  "eggs": [...],
  "pigeonneaux": [...],
  "healthRecords": [...],
  "sales": [...],
  "notifications": [...],
  "statistics": {
    "totalCouples": 5,
    "totalEggs": 12,
    "totalPigeonneaux": 10,
    "totalHealthRecords": 8,
    "totalSales": 3
  }
}
```

---

## 🔍 COMMENT TROUVER VOS SAUVEGARDES ?

### Sur Windows :

#### Méthode 1 : Explorer de fichiers
1. Ouvrez l'**Explorateur Windows**
2. Naviguez vers : `C:\Users\dabad\Desktop\Pigeon-Farm\backend\backups\`
3. Vous verrez tous vos fichiers de sauvegarde

#### Méthode 2 : Recherche Windows
1. Appuyez sur `Windows + S`
2. Tapez : `backup_user*.json`
3. Filtrez par emplacement : `Pigeon-Farm`

#### Méthode 3 : PowerShell
```powershell
# Lister toutes les sauvegardes
cd C:\Users\dabad\Desktop\Pigeon-Farm\backend\backups
dir *.json

# Afficher les détails
Get-ChildItem *.json | Select-Object Name, Length, LastWriteTime
```

---

## 💡 CONSEILS PRATIQUES

### 🔒 Sécurité

1. **Ne partagez JAMAIS vos fichiers de sauvegarde**
   - Ils contiennent toutes vos données
   - Email, nom, historique complet

2. **Chiffrez vos sauvegardes** (optionnel)
   ```bash
   # Avec 7-Zip (gratuit)
   7z a -p backup_user1.7z backup_user1.json
   ```

3. **Stockez des copies hors site**
   - Cloud privé (Google Drive chiffré, OneDrive)
   - Disque externe déconnecté
   - NAS personnel

### 📅 Fréquence Recommandée

| Utilisation | Fréquence |
|-------------|-----------|
| Usage intensif | **Quotidien** |
| Usage régulier | **Hebdomadaire** |
| Usage occasionnel | **Mensuel** |

### 🗑️ Nettoyage

**Configurez la rétention automatique :**
```javascript
// backend/config/backup-config.js
const backupOptions = {
  maxBackupsPerUser: 10,  // Garder 10 dernières
  retentionDays: 30,      // Supprimer > 30 jours
};
```

---

## 🚀 EXEMPLES D'UTILISATION

### Scénario 1 : Changement d'ordinateur

```
1. Sur ANCIEN PC :
   → Cliquez "Exporter mes données"
   → Fichier téléchargé : pigeon-farm-backup.json

2. Sur NOUVEL PC :
   → Installez PigeonFarm
   → Créez un compte
   → Cliquez "Importer depuis un fichier"
   → Sélectionnez pigeon-farm-backup.json
   → ✅ Toutes vos données sont restaurées !
```

### Scénario 2 : Sauvegarde régulière

```
Chaque dimanche soir :
1. Connectez-vous à PigeonFarm
2. Allez dans "Sauvegarde & Restauration"
3. Cliquez "Sauvegarder sur serveur"
4. ✅ Copie de sécurité créée

→ Vous aurez toujours les 4 dernières semaines sauvegardées
```

### Scénario 3 : Test de nouvelles fonctionnalités

```
Avant de tester quelque chose :
1. "Sauvegarder sur serveur"
2. Testez vos modifications
3. Si problème → "Restaurer" la sauvegarde
4. ✅ Retour à l'état précédent !
```

---

## 🛠️ DÉPANNAGE

### Problème : "Dossier backups introuvable"

**Solution :**
```bash
# PowerShell
cd C:\Users\dabad\Desktop\Pigeon-Farm\backend
New-Item -ItemType Directory -Force -Path backups
```

### Problème : "Accès refusé"

**Solution :** Vérifiez les permissions du dossier
```powershell
# Donner les droits complets
icacls backups /grant Users:(OI)(CI)F
```

### Problème : "Sauvegarde trop volumineuse"

**Solution :** Activez la compression
```javascript
// backup-config.js
enableCompression: true  // Fichiers .json.gz
```

---

## 📊 STATISTIQUES

### Taille Moyenne des Sauvegardes

| Données | Taille estimée |
|---------|----------------|
| 10 couples, 20 œufs, 15 pigeonneaux | ~50 KB |
| 50 couples, 100 œufs, 75 pigeonneaux | ~200 KB |
| 100 couples, 300 œufs, 200 pigeonneaux | ~500 KB |

### Espace Disque Requis

**Pour 10 sauvegardes :** ~2-5 MB
**Pour 30 jours (quotidien) :** ~6-15 MB
**Pour 1 an (hebdomadaire) :** ~10-25 MB

→ **Très peu d'espace requis !**

---

## 📞 SUPPORT

Des questions sur les sauvegardes ?

- 📧 Email : support@pigeonfarm.com
- 📚 Documentation complète : `TRANSACTIONS_ET_BACKUP.md`
- 💬 Forum : [lien vers forum]

---

## ✅ CHECKLIST DE VÉRIFICATION

Avant de commencer à utiliser votre application :

- [ ] ✅ Le dossier `backend/backups/` existe
- [ ] ✅ Vous avez configuré l'emplacement souhaité
- [ ] ✅ Vous pouvez créer une sauvegarde test
- [ ] ✅ Vous pouvez lister vos sauvegardes
- [ ] ✅ Vous savez restaurer une sauvegarde
- [ ] ✅ Vous avez planifié votre fréquence de sauvegarde

---

**🎉 Vous êtes maintenant prêt à sauvegarder vos données en toute sécurité !**

---

*Dernière mise à jour : 27 Octobre 2025*
