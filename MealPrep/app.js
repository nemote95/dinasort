const servingOutput = document.querySelector('#servings-value');
const budgetRange = document.querySelector('#budget-range');
const budgetOutput = document.querySelector('#budget-value');
const toast = document.querySelector('#toast');
let servings = 2;
let toastTimeout;

function announce(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

function updateServings() {
  servingOutput.textContent = servings;
  document.querySelector('#plan-servings').textContent = `${servings} ${servings === 1 ? 'person' : 'people'}`;
}

function updateBudget() {
  const budget = Number(budgetRange.value);
  const progress = ((budget - Number(budgetRange.min)) / (Number(budgetRange.max) - Number(budgetRange.min))) * 100;
  budgetRange.style.setProperty('--range-progress', `${progress}%`);
  budgetOutput.textContent = `$${budget}${budget === Number(budgetRange.max) ? '+' : ''}`;
  document.querySelector('#plan-budget').textContent = budgetOutput.textContent;
}

document.querySelectorAll('[data-serving-change]').forEach((button) => {
  button.addEventListener('click', () => {
    servings = Math.min(12, Math.max(1, servings + Number(button.dataset.servingChange)));
    updateServings();
  });
});

document.querySelectorAll('.choice-card').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.choice-card').forEach((choice) => {
      const selected = choice === button;
      choice.classList.toggle('selected', selected);
      choice.setAttribute('aria-pressed', String(selected));
    });
  });
});

document.querySelectorAll('.pref-tag').forEach((button) => {
  button.addEventListener('click', () => {
    const isNoPreference = button.textContent.trim() === 'No preference';
    if (isNoPreference) {
      document.querySelectorAll('.pref-tag').forEach((tag) => tag.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      return;
    }
    button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
    document.querySelector('.pref-tag:last-child').setAttribute('aria-pressed', 'false');
  });
});

budgetRange.addEventListener('input', updateBudget);

const tabs = [...document.querySelectorAll('[role="tab"]')];
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
      document.querySelector(`#${item.getAttribute('aria-controls')}`).hidden = !selected;
    });
  });
});

document.querySelector('[data-shopping-nav]').addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector('#tab-shopping').click();
  document.querySelector('#panel-shopping').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const shoppingItems = [...document.querySelectorAll('.shopping-item input')];
function updateShoppingProgress() {
  const checked = shoppingItems.filter((item) => item.checked).length;
  document.querySelector('#checked-count').textContent = checked;
  document.querySelector('#progress-fill').style.width = `${(checked / shoppingItems.length) * 100}%`;
}
shoppingItems.forEach((item) => item.addEventListener('change', updateShoppingProgress));

document.querySelector('#generate-button').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const originalLabel = button.querySelector('span:nth-child(2)').textContent;
  button.disabled = true;
  button.querySelector('span:nth-child(2)').textContent = 'Gathering your preferences…';
  window.setTimeout(() => {
    button.disabled = false;
    button.querySelector('span:nth-child(2)').textContent = originalLabel;
    announce('Your sample plan is ready to explore.');
    document.querySelector('#results-title').textContent = 'Your week, taking shape';
    document.querySelector('#tab-plan').click();
    document.querySelector('#plan').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 650);
});

document.querySelector('#copy-list').addEventListener('click', async () => {
  const lines = ['Shopping list', ...[...document.querySelectorAll('.shopping-category')].flatMap((category) => [
    category.querySelector('h3').textContent.replace(/\s+\d+ ITEMS?$/, ''),
    ...[...category.querySelectorAll('.shopping-item')].map((item) => `- ${item.querySelector('span:nth-of-type(2)').textContent} (${item.querySelector('small').textContent})`),
  ])];
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    announce('Shopping list copied.');
  } catch {
    announce('Clipboard access is unavailable in this browser.');
  }
});

document.querySelector('.print-button').addEventListener('click', () => window.print());
updateServings();
updateBudget();
