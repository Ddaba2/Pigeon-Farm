# Résumé : Nettoyage de la base de données

## ✅ Base de données nettoyée avec succès

La base de données a été nettoyée le `date`. Toutes les données de test ont été supprimées.

### Données supprimées

- **Couples** : 1 enregistrement
- **Œufs** : 1 enregistrement
- **Pigeonneaux** : 1 enregistrement
- **Suivis de santé** : 8 enregistrements
- **Ventes** : 7 enregistrements
- **Notifications** : 11 enregistrements
- **Sessions** : 2 enregistrements
- **Préférences utilisateur** : 2 enregistrements
- **Utilisateurs non-admin** : 12 utilisateurs

### Utilisateur admin créé

Un utilisateur administrateur a été créé avec les informations suivantes :

```
Username: admin
Password: admin123
Email: admin@pigeonfarm.com
```

⚠️ **IMPORTANT** : Changez le mot de passe après la première connexion !

## 📋 Prochaines étapes

1. **Connectez-vous** avec les identifiants admin
2. **Créez votre premier couple** de pigeons
3. **Ajoutez des œufs** pour ce couple
4. **Ajoutez des pigeonneaux** une fois éclos
5. **Ajoutez des suivis de santé** pour vos pigeons

## 🛠️ Scripts disponibles

Deux scripts sont disponibles pour gérer la base de données :

### 1. Nettoyage de la base de données
```bash
cd backend
node clean-database.js
```
Supprime toutes les données de test tout en préservant :
- Les utilisateurs admin
- La structure de la base de données

### 2. Réinitialisation complète
```bash
cd backend
node reset-database.js
```
⚠️ Supprime TOUTES les données et recrée la base de données depuis zéro.

### 3. Créer un utilisateur admin
```bash
cd backend
node create-admin.js
```
Crée un nouvel utilisateur admin si aucun n'existe.

## 🔍 Note sur les IDs

Lors de l'ajout d'un suivi de santé :
- Pour les **couples** : Entrez le numéro d'ID du couple (1, 2, 3, etc.), pas le nestNumber (CO0, A82)
- Pour les **pigeonneaux** : Entrez l'ID numérique du pigeonneau

Le système extrait automatiquement les chiffres si vous entrez un texte contenant des chiffres.

## 📝 Exemple d'utilisation

1. Connectez-vous avec `admin` / `admin123`
2. Allez dans "Couples" et créez un couple
3. Notez l'ID du couple créé (par exemple : 1)
4. Allez dans "Suivi de Santé"
5. Cliquez sur "Nouvel enregistrement"
6. Sélectionnez "Couple" comme cible
7. Entrez l'ID du couple (1)
8. Remplissez les autres champs
9. Cliquez sur "Enregistrer"

