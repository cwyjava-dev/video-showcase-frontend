import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function Debug() {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">i18n Debug Page</h1>
        
        <div className="bg-card p-4 rounded-lg border border-border space-y-4">
          <h2 className="text-xl font-semibold">Current Language: {i18n.language}</h2>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Language Buttons:</h3>
            <div className="flex gap-2">
              <Button 
                onClick={() => i18n.changeLanguage('zh')}
                variant={i18n.language === 'zh' ? 'default' : 'outline'}
              >
                中文
              </Button>
              <Button 
                onClick={() => i18n.changeLanguage('en')}
                variant={i18n.language === 'en' ? 'default' : 'outline'}
              >
                English
              </Button>
              <Button 
                onClick={() => i18n.changeLanguage('ko')}
                variant={i18n.language === 'ko' ? 'default' : 'outline'}
              >
                한국어
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Translation Tests:</h3>
            <div className="bg-background p-3 rounded space-y-2 text-sm">
              <p>navigation.home: {t('navigation.home')}</p>
              <p>navigation.explore: {t('navigation.explore')}</p>
              <p>navigation.history: {t('navigation.history')}</p>
              <p>navigation.liked: {t('navigation.liked')}</p>
              <p>common.search: {t('common.search')}</p>
              <p>admin.dashboard: {t('admin.dashboard')}</p>
              <p>admin.videos: {t('admin.videos')}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">i18n Info:</h3>
            <div className="bg-background p-3 rounded space-y-2 text-sm font-mono">
              <p>Language: {i18n.language}</p>
              <p>Languages: {JSON.stringify(i18n.languages)}</p>
              <p>Loaded: {JSON.stringify(Object.keys(i18n.store.data))}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
