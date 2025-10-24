# Corrections : Emails et Google OAuth

## Problèmes identifiés et corrigés

### 1. **Emails non envoyés lors du changement de mot de passe**

**Problème** : Quand un utilisateur changeait son mot de passe depuis son profil, aucun email de confirmation n'était envoyé.

**Solution** :
- Ajout de templates d'email pour les notifications de changement de mot de passe dans `backend/services/emailService.js`
- Ajout de l'envoi d'email dans `backend/routes/users.js` après un changement de mot de passe réussi
- L'email est envoyé de manière asynchrone et n'empêche pas la requête de réussir si l'envoi échoue

**Fichiers modifiés** :
- `backend/services/emailService.js` : Ajout de `generatePasswordChangedTemplate()` et `sendPasswordChangedNotification()`
- `backend/routes/users.js` : Ajout de l'envoi d'email après le changement de mot de passe (lignes 263-271)

### 2. **Emails non envoyés lors de la suppression de compte**

**Problème** : Quand un utilisateur supprimait son propre compte, aucun email de confirmation n'était envoyé (alors que c'était déjà en place pour les suppressions par admin).

**Solution** :
- Ajout de templates d'email spécifiques pour les suppressions de compte par utilisateur dans `backend/services/emailService.js`
- Ajout de l'envoi d'email dans `backend/routes/users.js` AVANT la suppression du compte
- L'email est envoyé avant la suppression pour garantir que l'utilisateur existe encore dans la base de données

**Fichiers modifiés** :
- `backend/services/emailService.js` : Ajout de `generateAccountDeletedByUserTemplate()` et `sendAccountDeletedByUserNotification()`
- `backend/routes/users.js` : Ajout de l'envoi d'email avant la suppression (lignes 393-400)

### 3. **Google OAuth ne fonctionne pas**

**Problèmes identifiés** :
1. La fonction `createSession()` n'était pas `await` dans le callback OAuth
2. Les variables d'environnement pour Google OAuth n'étaient pas définies dans `config.env`

**Solutions** :
- Correction de l'appel à `createSession()` pour utiliser `await` dans `backend/routes/oauth.js`
- Ajout des variables d'environnement manquantes dans `backend/config.env`

**Fichiers modifiés** :
- `backend/routes/oauth.js` : Ajout de `await` avant `createSession()` (ligne 51)
- `backend/config.env` : Ajout des variables OAuth (lignes 22-30)

## Configuration requise pour Google OAuth

Pour que Google OAuth fonctionne, vous devez :

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API "Google+ API" (ou "People API")

### 2. Créer des identifiants OAuth 2.0

1. Allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "OAuth client ID"
3. Sélectionnez "Web application"
4. Configurez :
   - **Name** : PigeonFarm (ou un nom de votre choix)
   - **Authorized JavaScript origins** : `http://localhost:3002`
   - **Authorized redirect URIs** : `http://localhost:3002/api/oauth/google/callback`
5. Cliquez sur "Create"
6. Copiez le **Client ID** et le **Client Secret**

### 3. Configurer les variables d'environnement

Ajoutez les identifiants dans `backend/config.env` :

```env
GOOGLE_CLIENT_ID=votre-client-id-ici
GOOGLE_CLIENT_SECRET=votre-client-secret-ici
GOOGLE_REDIRECT_URI=http://localhost:3002/api/oauth/google/callback
```

### 4. Redémarrer le serveur

Après avoir ajouté les identifiants, redémarrez le serveur backend :

```bash
cd backend
npm start
```

## Test des fonctionnalités

### Test des emails

1. **Changement de mot de passe** :
   - Connectez-vous à votre compte
   - Allez dans votre profil
   - Changez votre mot de passe
   - Vérifiez votre boîte email (incluant les spams)

2. **Suppression de compte** :
   - Connectez-vous à votre compte
   - Allez dans les paramètres de votre profil
   - Supprimez votre compte (en tapant "SUPPRIMER")
   - Vérifiez votre boîte email (incluant les spams)

### Test de Google OAuth

1. Vérifiez que les identifiants sont configurés
2. Redémarrez le serveur
3. Essayez de vous connecter avec Google
4. Vous devriez être redirigé vers Google pour authentification
5. Après authentification, vous serez redirigé vers votre application

## Emails configurés

Les emails utilisent la configuration SMTP déjà présente dans `config.env` :
- **SMTP Host** : smtp.gmail.com
- **SMTP Port** : 587
- **SMTP User** : dabadiallo694@gmail.com
- **SMTP Pass** : (configuré)

Les emails seront envoyés depuis l'adresse configurée dans `SMTP_USER`.

## Notes importantes

1. **Mode test** : Si les identifiants SMTP ne sont pas valides, les emails seront affichés dans la console du serveur au lieu d'être envoyés réellement
2. **Spam** : Les emails peuvent arriver dans le dossier spam, vérifiez régulièrement
3. **Google OAuth** : Si les identifiants ne sont pas configurés, la connexion Google retournera une erreur mais le reste de l'application fonctionnera normalement
4. **Production** : Pour la production, mettez à jour les URLs dans `config.env` pour utiliser votre domaine réel

## Résumé des changements

- ✅ Ajout de notifications email pour changement de mot de passe
- ✅ Ajout de notifications email pour suppression de compte
- ✅ Correction du callback Google OAuth
- ✅ Ajout des variables d'environnement OAuth manquantes
- ✅ Templates d'email professionnels et informatifs

Tous les fichiers modifiés ont été vérifiés et ne contiennent pas d'erreurs de linting.

