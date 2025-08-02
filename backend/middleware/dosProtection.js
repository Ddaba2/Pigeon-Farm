  max: 2000, // Augmenter la limite à 2000 requêtes par minute
    console.log(`[DOS WARNING] IP ${ip} a dépassé la limite de requêtes`);
  // Patterns d'attaque évidents seulement
    // Tentatives d'injection SQL évidentes
    /(\b(UNION|SCRIPT)\b)/i,
    // Tentatives XSS évidentes
    /<script[^>]*>/i,
    // Tentatives de commande système évidentes
    console.log(`[ATTACK WARNING] Pattern suspect détecté: IP: ${ip}, Pattern: ${url}, User-Agent: ${userAgent}`);
    // Bloquer l'IP seulement si trop de tentatives
    if (recentAttempts.length > 50) { // Augmenter le seuil
      console.log(`[IP WARNING] ${ip} a trop de tentatives suspectes`);
      // Ne pas bloquer, juste avertir