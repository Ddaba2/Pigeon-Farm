# 📁 Dossier de Sauvegardes PigeonFarm

Ce dossier contient les sauvegardes automatiques et manuelles des données utilisateurs.

## 📋 Format des Fichiers

Les fichiers de sauvegarde suivent ce format :
```
backup_user{ID}_{TIMESTAMP}.json
```

Exemple : `backup_user1_2025-10-27T14-30-00-000Z.json`

## 🔒 Sécurité

⚠️ **IMPORTANT** : 
- Ce dossier contient des données sensibles
- Ne partagez JAMAIS ces fichiers
- Assurez-vous que seul le serveur a accès à ce dossier
- Configurez les permissions appropriées en production

## 📦 Structure d'une Sauvegarde

```json
{
  "metadata": {
    "version": "1.0",
    "exportDate": "2025-10-27T14:30:00.000Z",
    "userId": 1,
    "username": "john_doe"
  },
  "user": { ... },
  "couples": [ ... ],
  "eggs": [ ... ],
  "pigeonneaux": [ ... ],
  "healthRecords": [ ... ],
  "sales": [ ... ],
  "notifications": [ ... ],
  "statistics": { ... }
}
```

## 🗑️ Nettoyage

Les anciennes sauvegardes peuvent être supprimées manuellement pour économiser de l'espace disque.

**Recommandation** : Conserver au moins les 5 dernières sauvegardes de chaque utilisateur.

## 📊 Statistiques

- Fréquence recommandée : 1 fois par semaine
- Taille moyenne : 50-200 KB par sauvegarde
- Rétention : 30 jours (personnalisable)

---

**Ne supprimez pas ce fichier README.md**
