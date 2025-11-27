# 🔄 Transactions et Sauvegarde/Restauration - Guide Complet

## 📚 Table des Matières
1. [Transactions pour Opérations Critiques](#transactions)
2. [Système de Sauvegarde et Restauration](#sauvegarde-restauration)
3. [Exemples d'Utilisation](#exemples)
4. [API Reference](#api-reference)

---

## 🔄 PARTIE 1 : Transactions pour Opérations Critiques

### ❌ Problème Identifié

**Scénario sans transaction** (DANGEREUX) :
```javascript
// ❌ Code problématique (actuel dans pigeonneauService.js)
async createPigeonneau(pigeonneauData) {
  // Étape 1 : Créer l'œuf
  const eggResult = await executeQuery('INSERT INTO eggs ...');
  const eggId = eggResult.insertId;  // ✅ Réussi
  
  // Étape 2 : Créer le pigeonneau
  const result = await executeQuery('INSERT INTO pigeonneaux ...'); // ❌ ERREUR !
  
  // PROBLÈME : L'œuf est créé mais pas le pigeonneau
  // → Données incohérentes dans la base de données !
}
```

**Qu'est-ce qui peut mal tourner ?**
- ❌ Panne réseau entre les deux requêtes
- ❌ Erreur de validation sur le pigeonneau
- ❌ Timeout de base de données
- ❌ Contrainte de clé étrangère violée
- **Résultat** : Œuf orphelin sans pigeonneau associé

### ✅ Solution : Transactions ACID

**Principe ACID** :
- **A**tomicity (Atomicité) : Tout ou rien
- **C**onsistency (Cohérence) : Données toujours valides
- **I**solation : Pas d'interférence entre transactions
- **D**urability (Durabilité) : Changements permanents

### 📝 Nouvelles Méthodes Créées

#### 1. `createEggWithHatching()`
Crée un œuf ET un pigeonneau en une seule transaction atomique.

```javascript
// ✅ Code avec transaction (nouveau dans eggService.js)
async createEggWithHatching(eggData, pigeonneauData = null) {
  return await executeTransaction(async (connection) => {
    // Étape 1 : Vérifier le couple
    const [coupleCheck] = await connection.execute(...);
    
    // Étape 2 : Créer l'œuf
    const [eggResult] = await connection.execute('INSERT INTO eggs ...');
    
    // Étape 3 : Créer le pigeonneau (si éclosion réussie)
    if (pigeonneauData && eggData.success1) {
      const [pigeonneauResult] = await connection.execute('INSERT INTO pigeonneaux ...');
    }
    
    // Si AUCUNE erreur → COMMIT
    // Si UNE erreur → ROLLBACK automatique (tout est annulé)
    return { egg, pigeonneau };
  });
}
```

**Avantages** :
- ✅ Si l'œuf est créé MAIS le pigeonneau échoue → TOUT est annulé
- ✅ Soit les DEUX sont créés, soit AUCUN
- ✅ Pas de données incohérentes
- ✅ Intégrité garantie

#### 2. `hatchEggAndCreatePigeonneau()`
Marque un œuf comme éclos ET crée le pigeonneau associé.

```javascript
async hatchEggAndCreatePigeonneau(eggId, hatchData, pigeonneauData) {
  return await executeTransaction(async (connection) => {
    // 1. Vérifier que l'œuf existe
    // 2. Mettre à jour l'œuf (hatchDate, success)
    // 3. Créer le pigeonneau
    // → Tout ou rien !
  });
}
```

### 🎯 Exemples d'Utilisation

#### Exemple 1 : Créer un œuf avec éclosion réussie

```javascript
const eggService = require('./services/eggService');

const result = await eggService.createEggWithHatching(
  {
    coupleId: 1,
    egg1Date: '2025-01-15',
    hatchDate1: '2025-02-01',
    success1: true,
    observations: 'Éclosion normale'
  },
  {
    sex: 'male',
    weight: 25,
    observations: 'Pigeonneau en bonne santé'
  }
);

console.log('Œuf créé:', result.egg.id);
console.log('Pigeonneau créé:', result.pigeonneau.id);
```

#### Exemple 2 : Marquer un œuf existant comme éclos

```javascript
const result = await eggService.hatchEggAndCreatePigeonneau(
  5, // ID de l'œuf
  {
    hatchDate: '2025-02-01',
    observations: 'Éclosion ce matin'
  },
  {
    sex: 'female',
    weight: 23
  }
);
```

---

## 💾 PARTIE 2 : Système de Sauvegarde et Restauration

### 🎯 Objectif

Permettre aux utilisateurs de :
1. **Sauvegarder** toutes leurs données
2. **Exporter** en fichier JSON
3. **Importer** depuis un fichier JSON
4. **Restaurer** depuis le serveur
5. **Supprimer** toutes leurs données (avec confirmation)

### 📦 Architecture

```
BackupService (backend)
    ↓
BackupRouter (API REST)
    ↓
API Frontend (api.ts)
    ↓
BackupRestore Component (React)
```

### 🔧 Fonctionnalités

#### 1. Export des Données

```javascript
// Récupère TOUTES les données de l'utilisateur
const backup = await backupService.exportUserData(userId);

// Structure du backup :
{
  metadata: {
    version: '1.0',
    exportDate: '2025-10-27T...',
    userId: 1,
    username: 'john_doe'
  },
  user: { ... },
  couples: [ ... ],
  eggs: [ ... ],
  pigeonneaux: [ ... ],
  healthRecords: [ ... ],
  sales: [ ... ],
  notifications: [ ... ],
  statistics: {
    totalCouples: 5,
    totalPigeonneaux: 12,
    ...
  }
}
```

#### 2. Sauvegarde Serveur

```javascript
// Sauvegarde dans backend/backups/
const result = await backupService.saveBackupToFile(userId, backupData);

// Fichier créé : backup_user1_2025-10-27T14-30-00.json
```

#### 3. Import/Restauration

```javascript
// Restaurer depuis un fichier JSON
const result = await backupService.importUserData(userId, backupData, {
  clearExisting: false, // false = ajouter, true = remplacer
  skipNotifications: true
});

// Résultat :
{
  success: true,
  imported: {
    couples: 5,
    eggs: 10,
    pigeonneaux: 12,
    healthRecords: 8,
    sales: 3
  }
}
```

#### 4. Suppression Complète

```javascript
// DANGEREUX : Supprime TOUTES les données
await backupService.clearUserData(userId);
```

### 🌐 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/backup/export` | Exporter en JSON (téléchargement) |
| POST | `/api/backup/save` | Sauvegarder sur serveur |
| POST | `/api/backup/import` | Importer depuis JSON |
| GET | `/api/backup/list` | Lister les sauvegardes |
| POST | `/api/backup/restore/:filename` | Restaurer depuis serveur |
| DELETE | `/api/backup/clear` | Supprimer toutes les données |

### 🎨 Interface Utilisateur (React)

Le composant `BackupRestore.tsx` offre :

1. **Bouton "Exporter mes données"** 
   - Télécharge un fichier JSON
   - Format : `pigeon-farm-backup-2025-10-27.json`

2. **Bouton "Sauvegarder sur serveur"**
   - Crée un fichier sur le serveur
   - Utile pour backup automatique

3. **Bouton "Importer depuis un fichier"**
   - Upload d'un fichier JSON
   - Ajoute les données aux données existantes

4. **Liste des sauvegardes serveur**
   - Affiche toutes les sauvegardes disponibles
   - Bouton "Restaurer" pour chaque sauvegarde

5. **Bouton "Supprimer toutes mes données"**
   - ⚠️ DANGEREUX
   - Demande confirmation par mot de passe

### 🔒 Sécurité

- ✅ Authentification requise (middleware)
- ✅ Utilisateur ne peut accéder qu'à SES sauvegardes
- ✅ Suppression nécessite mot de passe
- ✅ Validation des données importées
- ✅ Logs de toutes les opérations

---

## 📖 EXEMPLES D'UTILISATION

### Exemple 1 : Sauvegarder avant Migration

```typescript
// 1. Créer une sauvegarde
await saveBackupToServer();

// 2. Migrer les données
// ...

// 3. En cas de problème, restaurer
await restoreFromServerBackup('backup_user1_2025-10-27.json');
```

### Exemple 2 : Transférer vers un Autre Compte

```typescript
// Compte A : Exporter
const dataA = await exportUserData();

// Télécharger le fichier JSON

// Compte B : Se connecter et importer
await importUserData(dataA, false); // Ajouter aux données
```

### Exemple 3 : Réinitialisation Complète

```typescript
// 1. Créer une sauvegarde de sécurité
await saveBackupToServer();

// 2. Supprimer toutes les données
await clearAllUserData('mon_mot_de_passe');

// 3. Recommencer à zéro ou restaurer
```

---

## 🚀 Comment Intégrer dans l'Application

### 1. Ajouter dans Navigation.tsx

```typescript
<button onClick={() => setActiveTab('backup')}>
  <Database className="h-5 w-5" />
  <span>Sauvegarde</span>
</button>
```

### 2. Ajouter dans App.tsx

```typescript
import BackupRestore from './components/BackupRestore';

// Dans renderContent()
case 'backup':
  return <BackupRestore />;
```

### 3. Tester

```bash
# Démarrer le backend
cd backend
npm start

# Démarrer le frontend
npm run dev

# Naviguer vers http://localhost:5174
# Aller dans "Sauvegarde & Restauration"
```

---

## 📊 Avantages du Système

### Pour les Utilisateurs
- 🔒 **Sécurité** : Données sauvegardées
- 📱 **Mobilité** : Transférer vers un autre appareil
- 🔄 **Flexibilité** : Restaurer en cas de problème
- 💾 **Contrôle** : Exporter en JSON lisible

### Pour les Développeurs
- 🛡️ **Intégrité** : Transactions ACID
- 📝 **Traçabilité** : Logs complets
- 🔧 **Maintenabilité** : Code modulaire
- ✅ **Fiabilité** : Gestion d'erreurs robuste

---

## ⚠️ Recommandations

1. **Sauvegardez régulièrement** (au moins une fois par semaine)
2. **Testez la restauration** pour vérifier l'intégrité
3. **Gardez plusieurs versions** de sauvegardes
4. **Ne partagez JAMAIS** vos fichiers de sauvegarde (données sensibles)
5. **Utilisez des mots de passe forts** pour la suppression

---

## 🆘 Dépannage

### Problème : "Format de sauvegarde invalide"
**Solution** : Vérifiez que le fichier JSON est valide et contient `metadata.version`

### Problème : "Erreur lors de l'import"
**Solution** : Assurez-vous que la base de données est accessible et que les contraintes sont respectées

### Problème : "Session expirée"
**Solution** : Reconnectez-vous et réessayez

---

## 📞 Support

Pour toute question :
- 📧 Email : support@pigeonfarm.com
- 📚 Documentation : Dans l'application, menu "Aide"
- 🐛 Bugs : GitHub Issues

---

**Fait avec ❤️ pour la gestion d'élevage de pigeons**
