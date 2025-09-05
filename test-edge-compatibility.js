#!/usr/bin/env node

/**
 * Script de test de compatibilité Microsoft Edge
 * Ce script teste les fonctionnalités critiques pour Edge
 */

const http = require('http');
const https = require('https');
const url = require('url');

// Configuration
const config = {
  frontendUrl: 'http://localhost:5174',
  backendUrl: 'http://localhost:3002',
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
    const parsedUrl = url.parse(urlString);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.path,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Edge-Compatibility-Test/1.0',
        'Accept': 'application/json, text/html, */*',
        'Content-Type': 'application/json',
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
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Tests de compatibilité
const tests = [
  {
    name: 'Test de connectivité Frontend',
    test: async () => {
      const response = await makeRequest(config.frontendUrl);
      return {
        success: response.statusCode === 200,
        message: `Frontend accessible (${response.statusCode})`,
        details: `Headers: ${JSON.stringify(response.headers, null, 2)}`
      };
    }
  },
  {
    name: 'Test de connectivité Backend',
    test: async () => {
      const response = await makeRequest(`${config.backendUrl}/api/health`);
      return {
        success: response.statusCode === 200,
        message: `Backend accessible (${response.statusCode})`,
        details: `Response: ${response.data}`
      };
    }
  },
  {
    name: 'Test CORS Headers',
    test: async () => {
      const response = await makeRequest(`${config.backendUrl}/api/health`, {
        headers: {
          'Origin': config.frontendUrl,
          'Access-Control-Request-Method': 'GET'
        }
      });
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
        'Access-Control-Allow-Credentials': response.headers['access-control-allow-credentials'],
        'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
      };
      
      return {
        success: !!corsHeaders['Access-Control-Allow-Origin'],
        message: 'CORS configuré',
        details: `CORS Headers: ${JSON.stringify(corsHeaders, null, 2)}`
      };
    }
  },
  {
    name: 'Test Headers de Sécurité',
    test: async () => {
      const response = await makeRequest(`${config.backendUrl}/api/health`);
      
      const securityHeaders = {
        'X-UA-Compatible': response.headers['x-ua-compatible'],
        'X-Content-Type-Options': response.headers['x-content-type-options'],
        'X-Frame-Options': response.headers['x-frame-options'],
        'X-XSS-Protection': response.headers['x-xss-protection'],
        'Cache-Control': response.headers['cache-control']
      };
      
      const hasSecurityHeaders = Object.values(securityHeaders).some(header => header);
      
      return {
        success: hasSecurityHeaders,
        message: hasSecurityHeaders ? 'Headers de sécurité présents' : 'Headers de sécurité manquants',
        details: `Security Headers: ${JSON.stringify(securityHeaders, null, 2)}`
      };
    }
  },
  {
    name: 'Test API Auth',
    test: async () => {
      try {
        const response = await makeRequest(`${config.backendUrl}/api/auth/login`, {
          method: 'POST',
          body: JSON.stringify({
            username: 'test',
            password: 'test'
          })
        });
        
        return {
          success: response.statusCode === 401 || response.statusCode === 400, // Attendu pour des credentials invalides
          message: `API Auth répond (${response.statusCode})`,
          details: `Response: ${response.data}`
        };
      } catch (error) {
        return {
          success: false,
          message: 'Erreur API Auth',
          details: error.message
        };
      }
    }
  },
  {
    name: 'Test OPTIONS Preflight',
    test: async () => {
      try {
        const response = await makeRequest(`${config.backendUrl}/api/health`, {
          method: 'OPTIONS',
          headers: {
            'Origin': config.frontendUrl,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
          }
        });
        
        return {
          success: response.statusCode === 200 || response.statusCode === 204,
          message: `Preflight OK (${response.statusCode})`,
          details: `Headers: ${JSON.stringify(response.headers, null, 2)}`
        };
      } catch (error) {
        return {
          success: false,
          message: 'Erreur Preflight',
          details: error.message
        };
      }
    }
  }
];

// Fonction pour exécuter tous les tests
async function runTests() {
  console.log(`${colors.cyan}${colors.bright}🧪 Test de compatibilité Microsoft Edge${colors.reset}\n`);
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      console.log(`${colors.blue}⏳ ${test.name}...${colors.reset}`);
      
      const result = await test.test();
      
      if (result.success) {
        console.log(`${colors.green}✅ ${test.name}: ${result.message}${colors.reset}`);
        passedTests++;
      } else {
        console.log(`${colors.red}❌ ${test.name}: ${result.message}${colors.reset}`);
      }
      
      if (result.details) {
        console.log(`${colors.yellow}   Détails: ${result.details}${colors.reset}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`${colors.red}❌ ${test.name}: Erreur - ${error.message}${colors.reset}\n`);
    }
  }
  
  // Résumé
  console.log(`${colors.cyan}${colors.bright}📊 Résumé des tests${colors.reset}`);
  console.log(`${colors.green}✅ Tests réussis: ${passedTests}/${totalTests}${colors.reset}`);
  console.log(`${colors.red}❌ Tests échoués: ${totalTests - passedTests}/${totalTests}${colors.reset}`);
  
  if (passedTests === totalTests) {
    console.log(`${colors.green}${colors.bright}🎉 Tous les tests sont passés ! L'application est compatible Edge.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.yellow}${colors.bright}⚠️ Certains tests ont échoué. Vérifiez la configuration.${colors.reset}`);
    process.exit(1);
  }
}

// Fonction pour vérifier si les serveurs sont démarrés
async function checkServers() {
  console.log(`${colors.cyan}🔍 Vérification des serveurs...${colors.reset}\n`);
  
  try {
    await makeRequest(config.frontendUrl);
    console.log(`${colors.green}✅ Frontend accessible sur ${config.frontendUrl}${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}❌ Frontend non accessible sur ${config.frontendUrl}${colors.reset}`);
    console.log(`${colors.yellow}   Assurez-vous que le serveur de développement est démarré: npm run dev${colors.reset}\n`);
    process.exit(1);
  }
  
  try {
    await makeRequest(`${config.backendUrl}/api/health`);
    console.log(`${colors.green}✅ Backend accessible sur ${config.backendUrl}${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}❌ Backend non accessible sur ${config.backendUrl}${colors.reset}`);
    console.log(`${colors.yellow}   Assurez-vous que le serveur backend est démarré: cd backend && npm start${colors.reset}\n`);
    process.exit(1);
  }
  
  console.log('');
}

// Point d'entrée
async function main() {
  try {
    await checkServers();
    await runTests();
  } catch (error) {
    console.error(`${colors.red}❌ Erreur fatale: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { runTests, makeRequest, config };
