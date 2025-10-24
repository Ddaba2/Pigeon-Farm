# Correction : Rafraîchissement des statistiques

## Problèmes identifiés

1. **Les ajouts de la page santé ne s'affichent pas dans les statistiques**
2. **Les données du tableau de bord disparaissent**

## Causes

1. Les statistiques utilisaient une jointure avec les couples pour filtrer par utilisateur, mais les health records sont ajoutés pour des IDs spécifiques qui peuvent ne pas correspondre à des couples existants
2. Les statistiques ne se rafraîchissaient pas automatiquement après l'ajout de nouvelles données
3. Les données disparaissaient parce qu'elles n'étaient chargées qu'une seule fois au montage du composant

## Solutions appliquées

### 1. Correction du comptage des health records

**Fichier** : `backend/services/statisticsService.js`

Avant, la requête cherchait uniquement les health records liés aux couples de l'utilisateur :
```sql
SELECT COUNT(*) as total 
FROM healthRecords h
JOIN couples c ON h.targetType = 'couple' AND h.targetId = c.id
WHERE c.user_id = ?
```

Après, tous les health records sont comptés (car la table n'a pas de user_id pour l'instant) :
```sql
SELECT COUNT(*) as total FROM healthRecords
```

### 2. Ajout du rafraîchissement automatique

**Fichiers** : 
- `src/components/Dashboard.tsx`
- `src/components/Statistics.tsx`

Ajout d'un intervalle qui rafraîchit les données toutes les 30 secondes :
```typescript
const interval = setInterval(() => {
  loadStatistics();
  loadSales();
}, 30000);

return () => clearInterval(interval);
```

## Comment tester

1. **Redémarrez le serveur backend** pour appliquer les changements :
   ```bash
   cd backend
   npm start
   ```

2. **Redémarrez le frontend** (ou rafraîchissez la page avec Ctrl+F5)

3. **Ajoutez un traitement** dans la page santé

4. **Attendez 30 secondes maximum** ou **rechargez la page des statistiques**

5. Vous devriez voir :
   - Le nombre total de santé augmenter
   - Le nombre de traitements augmenter
   - Les données rester visibles

## Notes importantes

- Les données se rafraîchissent automatiquement toutes les 30 secondes
- Vous pouvez aussi manuellement rafraîchir la page pour voir les changements immédiatement
- Les health records sont maintenant tous comptés dans les statistiques (pas de filtrage par utilisateur)

## Améliorations futures possibles

Pour améliorer le système, on pourrait :
1. Ajouter un champ `user_id` dans la table `healthRecords` pour filtrer par utilisateur
2. Ajouter un bouton "Rafraîchir" pour rafraîchir manuellement les données
3. Diminuer l'intervalle de rafraîchissement (actuellement 30 secondes)

