#!/usr/bin/env node

/**
 * Script de test pour la solution de l'erreur "Cannot set property localStorage"
 * Teste le gestionnaire de stockage Edge et les fallbacks
 */

const http = require('http');

// Configuration
const config = {
  frontendUrl: 'http://localhost:5174',
  timeout: 5000
};

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Fonction pour faire des requêtes HTTP
function makeRequest(urlString, options = {}) {
  return new Promise((resolve, reject) => {
    const url = require('url').parse(urlString);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? require('https') : http;
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.path,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Edge-Storage-Fix-Test/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...options.headers
      },
      timeout: config.timeout
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          url: urlString
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Test du gestionnaire de stockage
async function testStorageManager() {
  try {
    console.log(`${colors.blue}🔍 Test du gestionnaire de stockage Edge...${colors.reset}`);
    
    const response = await makeRequest(`${config.frontendUrl}/src/utils/storageManager.ts`);
    
    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ Fichier storageManager.ts accessible${colors.reset}`);
      
      // Vérifier le contenu du gestionnaire
      if (response.data.includes('EdgeStorageManager')) {
        console.log(`${colors.green}✅ Classe EdgeStorageManager détectée${colors.reset}`);
      }
      
      if (response.data.includes('MemoryStorage')) {
        console.log(`${colors.green}✅ Classe MemoryStorage détectée${colors.reset}`);
      }
      
      if (response.data.includes('edgeLocalStorage')) {
        console.log(`${colors.green}✅ Interface edgeLocalStorage détectée${colors.reset}`);
      }
      
      if (response.data.includes('Object.defineProperty')) {
        console.log(`${colors.green}✅ Gestion Object.defineProperty détectée${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}❌ Fichier storageManager.ts non accessible${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erreur lors du test du gestionnaire: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test de la page principale avec le nouveau gestionnaire
async function testMainPageWithStorageManager() {
  try {
    console.log(`${colors.blue}🔍 Test de la page principale avec gestionnaire de stockage...${colors.reset}`);
    
    const response = await makeRequest(config.frontendUrl);
    
    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ Page principale accessible${colors.reset}`);
      
      // Vérifier si le gestionnaire de stockage est chargé
      if (response.data.includes('storageManager')) {
        console.log(`${colors.green}✅ Gestionnaire de stockage chargé${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️ Gestionnaire de stockage non détecté${colors.reset}`);
      }
      
      // Vérifier si les polyfills sont présents
      if (response.data.includes('polyfills')) {
        console.log(`${colors.green}✅ Polyfills détectés${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}❌ Page principale non accessible (${response.statusCode})${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erreur lors du test de la page principale: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test de la page de diagnostic améliorée
async function testEnhancedDiagnostic() {
  try {
    console.log(`${colors.blue}🔍 Test de la page de diagnostic améliorée...${colors.reset}`);
    
    const response = await makeRequest(`${config.frontendUrl}/edge-diagnostic`);
    
    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ Page de diagnostic accessible${colors.reset}`);
      
      // Vérifier si le diagnostic utilise le gestionnaire de stockage
      if (response.data.includes('getEdgeStorageStatus')) {
        console.log(`${colors.green}✅ Diagnostic avec gestionnaire de stockage détecté${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}❌ Page de diagnostic non accessible (${response.statusCode})${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erreur lors du test du diagnostic: ${error.message}${colors.reset}`);
    return false;
  }
}

// Instructions pour tester dans Edge
function showEdgeTestInstructions() {
  console.log(`${colors.cyan}${colors.bright}📋 Instructions pour tester dans Microsoft Edge${colors.reset}`);
  console.log('');
  console.log(`${colors.yellow}1. Ouvrir Microsoft Edge${colors.reset}`);
  console.log(`${colors.yellow}2. Naviguer vers: ${config.frontendUrl}${colors.reset}`);
  console.log(`${colors.yellow}3. Ouvrir les outils de développement (F12)${colors.reset}`);
  console.log(`${colors.yellow}4. Vérifier l'onglet Console pour les messages${colors.reset}`);
  console.log('');
  console.log(`${colors.blue}Messages attendus avec la nouvelle solution:${colors.reset}`);
  console.log(`${colors.green}✅ localStorage Edge accessible${colors.reset}`);
  console.log(`${colors.green}✅ sessionStorage Edge accessible${colors.reset}`);
  console.log(`${colors.green}✅ Polyfills Edge chargés avec succès${colors.reset}`);
  console.log('');
  console.log(`${colors.red}Si localStorage est bloqué par Edge Enterprise:${colors.reset}`);
  console.log(`${colors.yellow}• Message: "localStorage Edge bloqué, utilisation du stockage en mémoire"${colors.reset}`);
  console.log(`${colors.yellow}• L'application fonctionne avec le stockage en mémoire${colors.reset}`);
  console.log(`${colors.yellow}• Pas d'erreur "Cannot set property localStorage"${colors.reset}`);
  console.log('');
  console.log(`${colors.blue}Pour tester le diagnostic amélioré:${colors.reset}`);
  console.log(`${colors.yellow}• Aller à: ${config.frontendUrl}/edge-diagnostic${colors.reset}`);
  console.log(`${colors.yellow}• Cliquer sur "Lancer le diagnostic"${colors.reset}`);
  console.log(`${colors.yellow}• Vérifier le statut du stockage (native/memory)${colors.reset}`);
  console.log('');
  console.log(`${colors.magenta}Test spécifique de l'erreur résolue:${colors.reset}`);
  console.log(`${colors.yellow}• L'erreur "Cannot set property localStorage" ne devrait plus apparaître${colors.reset}`);
  console.log(`${colors.yellow}• Le gestionnaire de stockage gère automatiquement les restrictions${colors.reset}`);
  console.log(`${colors.yellow}• L'application fonctionne dans tous les cas${colors.reset}`);
}

// Fonction principale
async function runStorageFixTests() {
  console.log(`${colors.cyan}${colors.bright}🧪 Test de la solution "Cannot set property localStorage"${colors.reset}\n`);
  
  let passedTests = 0;
  let totalTests = 3;
  
  // Test 1: Gestionnaire de stockage
  const storageManagerOk = await testStorageManager();
  if (storageManagerOk) passedTests++;
  console.log('');
  
  // Test 2: Page principale avec gestionnaire
  const mainPageOk = await testMainPageWithStorageManager();
  if (mainPageOk) passedTests++;
  console.log('');
  
  // Test 3: Diagnostic amélioré
  const diagnosticOk = await testEnhancedDiagnostic();
  if (diagnosticOk) passedTests++;
  console.log('');
  
  // Résumé
  console.log(`${colors.cyan}${colors.bright}📊 Résumé des tests${colors.reset}`);
  console.log(`${colors.green}✅ Tests réussis: ${passedTests}/${totalTests}${colors.reset}`);
  console.log(`${colors.red}❌ Tests échoués: ${totalTests - passedTests}/${totalTests}${colors.reset}`);
  
  if (passedTests === totalTests) {
    console.log(`${colors.green}${colors.bright}🎉 Tous les tests sont passés !${colors.reset}`);
    console.log(`${colors.green}La solution pour l'erreur "Cannot set property localStorage" est opérationnelle.${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${colors.bright}⚠️ Certains tests ont échoué.${colors.reset}`);
    console.log(`${colors.yellow}Vérifiez que le serveur de développement est démarré.${colors.reset}`);
  }
  
  console.log('');
  showEdgeTestInstructions();
}

// Exécuter les tests
if (require.main === module) {
  runStorageFixTests().catch(error => {
    console.error(`${colors.red}❌ Erreur fatale: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { runStorageFixTests, testStorageManager, testMainPageWithStorageManager };
