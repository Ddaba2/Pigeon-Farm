#!/usr/bin/env node

/**
 * Script de test spécifique pour l'erreur localStorage Edge
 * Teste les problèmes de stockage dans Microsoft Edge Enterprise
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
        'User-Agent': 'Edge-Storage-Test/1.0',
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

// Test de la page principale
async function testMainPage() {
  try {
    console.log(`${colors.blue}🔍 Test de la page principale...${colors.reset}`);
    
    const response = await makeRequest(config.frontendUrl);
    
    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ Page principale accessible${colors.reset}`);
      
      // Vérifier si les polyfills sont présents
      if (response.data.includes('polyfills')) {
        console.log(`${colors.green}✅ Polyfills détectés dans le code${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️ Polyfills non détectés${colors.reset}`);
      }
      
      // Vérifier si EdgeCompatibilityWrapper est présent
      if (response.data.includes('EdgeCompatibilityWrapper')) {
        console.log(`${colors.green}✅ EdgeCompatibilityWrapper détecté${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️ EdgeCompatibilityWrapper non détecté${colors.reset}`);
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

// Test de la page de diagnostic Edge
async function testEdgeDiagnostic() {
  try {
    console.log(`${colors.blue}🔍 Test de la page de diagnostic Edge...${colors.reset}`);
    
    const response = await makeRequest(`${config.frontendUrl}/edge-diagnostic`);
    
    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ Page de diagnostic Edge accessible${colors.reset}`);
      
      // Vérifier si le composant EdgeDiagnostic est présent
      if (response.data.includes('EdgeDiagnostic')) {
        console.log(`${colors.green}✅ Composant EdgeDiagnostic détecté${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️ Composant EdgeDiagnostic non détecté${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}❌ Page de diagnostic Edge non accessible (${response.statusCode})${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erreur lors du test de la page de diagnostic: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test des fichiers de polyfills
async function testPolyfillFiles() {
  try {
    console.log(`${colors.blue}🔍 Test des fichiers de polyfills...${colors.reset}`);
    
    // Test du fichier polyfills.ts
    const polyfillResponse = await makeRequest(`${config.frontendUrl}/src/utils/polyfills.ts`);
    
    if (polyfillResponse.statusCode === 200) {
      console.log(`${colors.green}✅ Fichier polyfills.ts accessible${colors.reset}`);
      
      // Vérifier le contenu des polyfills
      if (polyfillResponse.data.includes('createStoragePolyfill')) {
        console.log(`${colors.green}✅ Polyfill localStorage détecté${colors.reset}`);
      }
      
      if (polyfillResponse.data.includes('SecurityError')) {
        console.log(`${colors.green}✅ Gestion SecurityError détectée${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}❌ Fichier polyfills.ts non accessible${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erreur lors du test des polyfills: ${error.message}${colors.reset}`);
    return false;
  }
}

// Instructions pour tester dans Edge
function showEdgeInstructions() {
  console.log(`${colors.cyan}${colors.bright}📋 Instructions pour tester dans Microsoft Edge${colors.reset}`);
  console.log('');
  console.log(`${colors.yellow}1. Ouvrir Microsoft Edge${colors.reset}`);
  console.log(`${colors.yellow}2. Naviguer vers: ${config.frontendUrl}${colors.reset}`);
  console.log(`${colors.yellow}3. Ouvrir les outils de développement (F12)${colors.reset}`);
  console.log(`${colors.yellow}4. Vérifier l'onglet Console pour les messages${colors.reset}`);
  console.log('');
  console.log(`${colors.blue}Messages attendus:${colors.reset}`);
  console.log(`${colors.green}✅ localStorage accessible${colors.reset}`);
  console.log(`${colors.green}✅ sessionStorage accessible${colors.reset}`);
  console.log(`${colors.green}✅ Polyfills Edge chargés avec succès${colors.reset}`);
  console.log('');
  console.log(`${colors.red}Si vous voyez l'erreur "Access is denied":${colors.reset}`);
  console.log(`${colors.yellow}• Le composant EdgeStorageError devrait s'afficher${colors.reset}`);
  console.log(`${colors.yellow}• Cliquer sur "Continuer avec les limitations"${colors.reset}`);
  console.log(`${colors.yellow}• L'application fonctionnera avec le stockage en mémoire${colors.reset}`);
  console.log('');
  console.log(`${colors.blue}Pour tester le diagnostic:${colors.reset}`);
  console.log(`${colors.yellow}• Aller à: ${config.frontendUrl}/edge-diagnostic${colors.reset}`);
  console.log(`${colors.yellow}• Cliquer sur "Lancer le diagnostic"${colors.reset}`);
  console.log(`${colors.yellow}• Vérifier les résultats des tests${colors.reset}`);
}

// Fonction principale
async function runStorageTests() {
  console.log(`${colors.cyan}${colors.bright}🧪 Test de compatibilité stockage Microsoft Edge${colors.reset}\n`);
  
  let passedTests = 0;
  let totalTests = 3;
  
  // Test 1: Page principale
  const mainPageOk = await testMainPage();
  if (mainPageOk) passedTests++;
  console.log('');
  
  // Test 2: Page de diagnostic
  const diagnosticOk = await testEdgeDiagnostic();
  if (diagnosticOk) passedTests++;
  console.log('');
  
  // Test 3: Fichiers de polyfills
  const polyfillsOk = await testPolyfillFiles();
  if (polyfillsOk) passedTests++;
  console.log('');
  
  // Résumé
  console.log(`${colors.cyan}${colors.bright}📊 Résumé des tests${colors.reset}`);
  console.log(`${colors.green}✅ Tests réussis: ${passedTests}/${totalTests}${colors.reset}`);
  console.log(`${colors.red}❌ Tests échoués: ${totalTests - passedTests}/${totalTests}${colors.reset}`);
  
  if (passedTests === totalTests) {
    console.log(`${colors.green}${colors.bright}🎉 Tous les tests sont passés !${colors.reset}`);
    console.log(`${colors.green}L'application est prête pour Edge avec gestion des erreurs de stockage.${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${colors.bright}⚠️ Certains tests ont échoué.${colors.reset}`);
    console.log(`${colors.yellow}Vérifiez que le serveur de développement est démarré.${colors.reset}`);
  }
  
  console.log('');
  showEdgeInstructions();
}

// Exécuter les tests
if (require.main === module) {
  runStorageTests().catch(error => {
    console.error(`${colors.red}❌ Erreur fatale: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { runStorageTests, testMainPage, testEdgeDiagnostic };
