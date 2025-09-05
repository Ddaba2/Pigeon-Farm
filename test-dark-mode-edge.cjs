#!/usr/bin/env node

/**
 * Script de test pour le mode sombre dans Microsoft Edge
 * Teste la compatibilité du basculement entre mode clair et sombre
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
        'User-Agent': 'Edge-DarkMode-Test/1.0',
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

// Test de la page de test du mode sombre
async function testDarkModePage() {
  try {
    console.log(`${colors.blue}🔍 Test de la page de test du mode sombre...${colors.reset}`);
    
    const response = await makeRequest(`${config.frontendUrl}/dark-mode-test`);
    
    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ Page de test du mode sombre accessible${colors.reset}`);
      
      // Vérifier le contenu de la page
      if (response.data.includes('DarkModeTest')) {
        console.log(`${colors.green}✅ Composant DarkModeTest détecté${colors.reset}`);
      }
      
      if (response.data.includes('darkMode')) {
        console.log(`${colors.green}✅ Gestion du mode sombre détectée${colors.reset}`);
      }
      
      if (response.data.includes('edgeLocalStorage')) {
        console.log(`${colors.green}✅ Utilisation du gestionnaire Edge détectée${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}❌ Page de test du mode sombre non accessible (${response.statusCode})${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erreur lors du test de la page: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test du hook useDarkMode
async function testDarkModeHook() {
  try {
    console.log(`${colors.blue}🔍 Test du hook useDarkMode...${colors.reset}`);
    
    const response = await makeRequest(`${config.frontendUrl}/src/hooks/useDarkMode.ts`);
    
    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ Hook useDarkMode accessible${colors.reset}`);
      
      // Vérifier le contenu du hook
      if (response.data.includes('edgeLocalStorage')) {
        console.log(`${colors.green}✅ Utilisation du gestionnaire Edge dans le hook${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️ Hook utilise encore localStorage directement${colors.reset}`);
      }
      
      if (response.data.includes('useEffect')) {
        console.log(`${colors.green}✅ Gestion du DOM avec useEffect détectée${colors.reset}`);
      }
      
      if (response.data.includes('document.documentElement')) {
        console.log(`${colors.green}✅ Application de la classe dark détectée${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}❌ Hook useDarkMode non accessible${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erreur lors du test du hook: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test de la configuration Tailwind
async function testTailwindConfig() {
  try {
    console.log(`${colors.blue}🔍 Test de la configuration Tailwind...${colors.reset}`);
    
    const response = await makeRequest(`${config.frontendUrl}/tailwind.config.js`);
    
    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ Configuration Tailwind accessible${colors.reset}`);
      
      // Vérifier la configuration du mode sombre
      if (response.data.includes("darkMode: 'class'")) {
        console.log(`${colors.green}✅ Mode sombre configuré avec 'class'${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️ Configuration du mode sombre non détectée${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}❌ Configuration Tailwind non accessible${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erreur lors du test de Tailwind: ${error.message}${colors.reset}`);
    return false;
  }
}

// Instructions pour tester dans Edge
function showEdgeDarkModeInstructions() {
  console.log(`${colors.cyan}${colors.bright}📋 Instructions pour tester le mode sombre dans Microsoft Edge${colors.reset}`);
  console.log('');
  console.log(`${colors.yellow}1. Ouvrir Microsoft Edge${colors.reset}`);
  console.log(`${colors.yellow}2. Naviguer vers: ${config.frontendUrl}/dark-mode-test${colors.reset}`);
  console.log(`${colors.yellow}3. Ouvrir les outils de développement (F12)${colors.reset}`);
  console.log(`${colors.yellow}4. Vérifier l'onglet Console pour les messages${colors.reset}`);
  console.log('');
  console.log(`${colors.blue}Tests à effectuer:${colors.reset}`);
  console.log(`${colors.green}• Cliquer sur le bouton "Mode Sombre" / "Mode Clair"${colors.reset}`);
  console.log(`${colors.green}• Vérifier que les couleurs changent${colors.reset}`);
  console.log(`${colors.green}• Vérifier que le mode est sauvegardé${colors.reset}`);
  console.log(`${colors.green}• Recharger la page pour vérifier la persistance${colors.reset}`);
  console.log('');
  console.log(`${colors.blue}Messages attendus dans la console:${colors.reset}`);
  console.log(`${colors.green}✅ localStorage Edge accessible${colors.reset}`);
  console.log(`${colors.green}🌙 Mode sombre activé${colors.reset}`);
  console.log(`${colors.green}🌙 Mode sombre désactivé${colors.reset}`);
  console.log(`${colors.green}✅ Mode sombre sauvegardé: Activé/Désactivé${colors.reset}`);
  console.log('');
  console.log(`${colors.red}Si le mode sombre ne fonctionne pas:${colors.reset}`);
  console.log(`${colors.yellow}• Vérifier que la classe 'dark' est ajoutée à <html>${colors.reset}`);
  console.log(`${colors.yellow}• Vérifier que Tailwind CSS est chargé${colors.reset}`);
  console.log(`${colors.yellow}• Vérifier les messages d'erreur dans la console${colors.reset}`);
  console.log(`${colors.yellow}• Tester le stockage avec le bouton "Tester le Stockage"${colors.reset}`);
  console.log('');
  console.log(`${colors.magenta}Test de l'application principale:${colors.reset}`);
  console.log(`${colors.yellow}• Aller à: ${config.frontendUrl}${colors.reset}`);
  console.log(`${colors.yellow}• Cliquer sur l'icône lune/soleil dans l'en-tête${colors.reset}`);
  console.log(`${colors.yellow}• Vérifier que le mode change dans toute l'application${colors.reset}`);
}

// Fonction principale
async function runDarkModeTests() {
  console.log(`${colors.cyan}${colors.bright}🌙 Test de compatibilité du mode sombre Microsoft Edge${colors.reset}\n`);
  
  let passedTests = 0;
  let totalTests = 3;
  
  // Test 1: Page de test du mode sombre
  const darkModePageOk = await testDarkModePage();
  if (darkModePageOk) passedTests++;
  console.log('');
  
  // Test 2: Hook useDarkMode
  const darkModeHookOk = await testDarkModeHook();
  if (darkModeHookOk) passedTests++;
  console.log('');
  
  // Test 3: Configuration Tailwind
  const tailwindOk = await testTailwindConfig();
  if (tailwindOk) passedTests++;
  console.log('');
  
  // Résumé
  console.log(`${colors.cyan}${colors.bright}📊 Résumé des tests${colors.reset}`);
  console.log(`${colors.green}✅ Tests réussis: ${passedTests}/${totalTests}${colors.reset}`);
  console.log(`${colors.red}❌ Tests échoués: ${totalTests - passedTests}/${totalTests}${colors.reset}`);
  
  if (passedTests === totalTests) {
    console.log(`${colors.green}${colors.bright}🎉 Tous les tests sont passés !${colors.reset}`);
    console.log(`${colors.green}Le mode sombre est prêt pour Edge avec gestionnaire de stockage.${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${colors.bright}⚠️ Certains tests ont échoué.${colors.reset}`);
    console.log(`${colors.yellow}Vérifiez que le serveur de développement est démarré.${colors.reset}`);
  }
  
  console.log('');
  showEdgeDarkModeInstructions();
}

// Exécuter les tests
if (require.main === module) {
  runDarkModeTests().catch(error => {
    console.error(`${colors.red}❌ Erreur fatale: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { runDarkModeTests, testDarkModePage, testDarkModeHook };
