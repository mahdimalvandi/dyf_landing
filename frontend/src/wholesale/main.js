import '../styles/wholesale.css';
import { initInquiryForm } from '../landing/modules/inquiry-form.js';
import { sampleTerms } from './sample-terms.js';
import { initMobileMenu, closeMobileMenu } from '../landing/modules/mobile-menu.js';
import { initSpecularHighlight } from '../landing/modules/specular.js';
import { initMobileContact } from '../landing/modules/mobile-contact.js';

initMobileMenu();
initMobileContact();
initSpecularHighlight();
document.querySelectorAll('.mobile-nav-link').forEach(link => link.addEventListener('click', closeMobileMenu));
const terms = document.getElementById('sampleTerms');
for (const group of sampleTerms) {
  const article = document.createElement('article');
  const heading = document.createElement('h3');
  heading.textContent = group.title;
  article.append(heading);
  const list = document.createElement('dl');
  for (const [label, value] of group.items) {
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    list.append(term, description);
  }
  article.append(list);
  terms.append(article);
}
initInquiryForm({ source: 'wholesale_page' });
document.querySelectorAll('[data-line]').forEach((link) => {
  link.addEventListener('click', () => {
    document.getElementById('linePreference').value = link.dataset.line;
  });
});
