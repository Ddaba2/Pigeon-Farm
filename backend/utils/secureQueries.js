import pool from '../config/database.js';

// Fonction pour exécuter des requêtes SQL de manière sécurisée
export const executeQuery = async (query, params = []) => {
  try {
    // Si params est un tableau, utiliser les paramètres positionnels
    if (Array.isArray(params)) {
      const [rows] = await pool.execute(query, params);
      return rows;
    }
    
    // Si params est un objet, utiliser buildQuery
    if (typeof params === 'object' && params !== null) {
      const { sql, values } = buildQuery(query, params);
      const [rows] = await pool.execute(sql, values);
      return rows;
    }
    
    // Si params est undefined ou null, exécuter sans paramètres
    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    console.error('Erreur exécution requête:', error);
    throw error;
  }
};

// Fonction pour construire une requête SQL avec des paramètres nommés
export const buildQuery = (query, params) => {
  let sql = query;
  const values = [];
  
  // Remplacer les paramètres nommés par des placeholders
  for (const [key, value] of Object.entries(params)) {
    const placeholder = `:${key}`;
    if (sql.includes(placeholder)) {
      sql = sql.replace(new RegExp(placeholder, 'g'), '?');
      values.push(value);
    }
  }
  
  return { sql, values };
};

// Fonction pour échapper une valeur
export const escapeValue = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }
  
  return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
};

// Fonction pour tester la connexion à la base de données
export const testDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion à la base de données réussie');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    return false;
  }
};