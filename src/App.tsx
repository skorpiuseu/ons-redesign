import { useState } from 'react';
import { DemoDataProvider, useDemoData } from './data/DemoDataProvider';
import {
  AccountingOverview,
  AreaNavigation,
  CategoryPlaceholder,
  PageHeader,
} from './components/AccountingSections';
import { VatRegister } from './components/VatRegister';
import { DemoBanner, Toast } from './components/Toast';
import { getSavedTheme, saveTheme } from './utils/theme';
import { CATEGORIES, DEFAULT_CATEGORY, DEFAULT_TOAST } from './constants/app';
import type { AccountingCategoryId } from './types/app';

function AppContent() {
  const { previewMode, setPreviewMode } = useDemoData();
  const [category, setCategory] = useState<AccountingCategoryId>(DEFAULT_CATEGORY);
  const [toast, setToast] = useState(DEFAULT_TOAST);
  const [demoBannerVisible, setDemoBannerVisible] = useState(true);
  const [dark, setDark] = useState(getSavedTheme);

  const toggleTheme = () => {
    const nextTheme = !dark;
    saveTheme(nextTheme);
    setDark(nextTheme);
  };

  const notifyBackend = (action: string) => {
    setToast(`${action} zainicjowano. Niepowodzenie: w wersji demo nie podłączono backendu.`);
  };
  const notifyUnavailableView = (view: string) => {
    setToast(`Widok „${view}” nie został jeszcze wdrożony w prototypie.`);
  };
  const notifyPeriodSelectionPending = () => {
    setToast('Wybór okresu księgowego będzie dostępny po konfiguracji.');
  };
  const selectCategory = (categoryId: AccountingCategoryId) => {
    setCategory(categoryId);
    if (categoryId !== 'vat') {
      const categoryLabel = CATEGORIES.find((item) => item.id === categoryId)?.label;
      notifyBackend(`Obszar: ${categoryLabel ?? categoryId}`);
    }
  };

  return (
    <div className={`app${dark ? ' dark' : ''}${demoBannerVisible ? ' has-demo-banner' : ''}`}>
      <PageHeader isDark={dark} onToggleTheme={toggleTheme} onAction={notifyBackend} />
      <main className="page" id="top">
        <AccountingOverview
          onOpenArea={(areaTitle: string) => notifyUnavailableView(`Obszar ${areaTitle}`)}
          onUnavailableView={notifyUnavailableView}
        />
        <div className="accounting-content-card">
          <AreaNavigation activeCategory={category} onSelectCategory={selectCategory} />
          <div
            id="area-content-panel"
            role="tabpanel"
            aria-labelledby={`area-tab-${category}`}
            tabIndex={0}
          >
            {category === 'vat' ? (
              <VatRegister
                onBackendAction={notifyBackend}
                onConfigurePeriod={(areaTitle) => notifyBackend(`Konfiguracja: ${areaTitle}`)}
                onSelectPeriod={notifyPeriodSelectionPending}
              />
            ) : (
              <CategoryPlaceholder
                categoryId={category}
                onConfigure={() => notifyBackend('Konfiguracja obszaru')}
              />
            )}
          </div>
        </div>
        <footer className="footer">
          <span>© 2026 Onsaldo</span>
          <button type="button" className="text-button" onClick={() => notifyBackend('Pomoc')}>
            Pomoc i informacje
          </button>
        </footer>
      </main>
      {demoBannerVisible && (
        <DemoBanner
          dataPreviewMode={previewMode}
          onDataPreviewModeChange={setPreviewMode}
          onClose={() => setDemoBannerVisible(false)}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(DEFAULT_TOAST)} />}
    </div>
  );
}

export default function App() {
  return (
    <DemoDataProvider>
      <AppContent />
    </DemoDataProvider>
  );
}
