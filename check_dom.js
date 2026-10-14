const fs = require('fs');
const content = fs.readFileSync('dom.html', 'utf8');
console.log('DOM length:', content.length);
console.log('Has orsund-globe-section:', content.includes('orsund-globe-section'));
console.log('Has framer-swlfyw (ticker):', content.includes('framer-swlfyw'));
console.log('Has framer-ymK09 (cards):', content.includes('framer-ymK09'));
console.log('Has framer-714rbw (mission control):', content.includes('framer-714rbw'));
console.log('Has framer-xJzg9 (faq):', content.includes('framer-xJzg9'));
