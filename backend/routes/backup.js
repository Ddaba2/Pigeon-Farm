import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import requireRole from '../middleware/roles.js';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Sauvegarde SQL complète (dump)
router.get('/export', requireRole('admin'), (req, res) => {
  const dbName = process.env.DB_NAME;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbHost = process.env.DB_HOST || 'localhost';
  const dumpFile = path.join(process.cwd(), `backup_${dbName}_${Date.now()}.sql`);
  const cmd = `mysqldump -h ${dbHost} -u ${dbUser} ${dbPassword ? '-p' + dbPassword : ''} ${dbName} > "${dumpFile}"`;
  exec(cmd, (error) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.download(dumpFile, (err) => {
      if (!err) {
        // Supprimer le fichier après téléchargement
        setTimeout(() => { try { fs.unlinkSync(dumpFile); } catch {} }, 10000);
      }
    });
  });
});

// Restauration SQL depuis un fichier uploadé
router.post('/import', requireRole('admin'), upload.single('sqlfile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier SQL fourni.' });
  }
  const dbName = process.env.DB_NAME;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbHost = process.env.DB_HOST || 'localhost';
  const filePath = req.file.path;
  const cmd = `mysql -h ${dbHost} -u ${dbUser} ${dbPassword ? '-p' + dbPassword : ''} ${dbName} < "${filePath}"`;
  exec(cmd, (error, stdout, stderr) => {
    // Supprimer le fichier uploadé après traitement
    fs.unlink(filePath, () => {});
    if (error) {
      return res.status(500).json({ error: stderr || error.message });
    }
    res.json({ success: true, message: 'Restauration terminée.' });
  });
});

export default router; 