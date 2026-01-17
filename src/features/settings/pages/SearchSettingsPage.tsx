import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export type SearchMode = 'normal' | 'advanced';

const SEARCH_MODE_KEY = 'search-mode-preference';

export const SearchSettingsPage = () => {
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState<SearchMode>(() => {
    const saved = localStorage.getItem(SEARCH_MODE_KEY);
    return (saved as SearchMode) || 'normal';
  });
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(SEARCH_MODE_KEY, searchMode);
  }, [searchMode]);

  const handleSave = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/inbox')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Inbox
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Search Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure how you want to search through your emails
            </p>
          </div>
        </div>

        {/* Success Message */}
        {showSaved && (
          <Alert>
            <Info className="h-4 w-4 text-green-600" />
            <AlertDescription>Search preferences saved successfully!</AlertDescription>
          </Alert>
        )}

        {/* Search Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Search Mode</CardTitle>
            <CardDescription>
              Choose how the search engine processes your queries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={searchMode}
              onValueChange={(value: SearchMode) => {
                setSearchMode(value);
                handleSave();
              }}
              className="space-y-4"
            >
              {/* Normal Search Option */}
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="normal" id="normal" className="mt-1" />
                <div className="flex-1">
                  <Label
                    htmlFor="normal"
                    className="text-base font-semibold cursor-pointer flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Normal Search
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fast text-based search with typo tolerance. Searches through email subjects,
                    sender names, and content using fuzzy matching. Best for finding emails when
                    you remember specific words or phrases.
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-16">Method:</span>
                      <span>Fuzzy matching with trigram similarity</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-16">Speed:</span>
                      <span>Very fast - instant results</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-16">Best for:</span>
                      <span>Finding exact words, names, or known phrases</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-16">Example:</span>
                      <span>"project meeting" finds emails containing those exact words</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Search Option */}
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="advanced" id="advanced" className="mt-1" />
                <div className="flex-1">
                  <Label
                    htmlFor="advanced"
                    className="text-base font-semibold cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Advanced Search
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI-powered semantic search that understands the meaning and context of your query.
                    Combines fuzzy matching with vector embeddings to find relevant emails even when
                    they don't contain your exact search terms. Best for conceptual searches.
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-16">Method:</span>
                      <span>Combined fuzzy + AI semantic search using embeddings</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-16">Speed:</span>
                      <span>Slightly slower - processes multiple search strategies</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-16">Best for:</span>
                      <span>Finding emails by topic, intent, or contextual meaning</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-16">Example:</span>
                      <span>"quarterly budget discussion" finds emails about Q4 finances</span>
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Advanced search requires the backend to have Gemini API configured.
            If Advanced search is enabled but semantic search is not available, the system will
            automatically fall back to Normal search mode.
          </AlertDescription>
        </Alert>

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Feature</th>
                    <th className="text-center py-2 px-4">Normal Search</th>
                    <th className="text-center py-2 px-4">Advanced Search</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4">Typo Tolerance</td>
                    <td className="text-center py-2 px-4">✓</td>
                    <td className="text-center py-2 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">Exact Word Matching</td>
                    <td className="text-center py-2 px-4">✓</td>
                    <td className="text-center py-2 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">Semantic Understanding</td>
                    <td className="text-center py-2 px-4">-</td>
                    <td className="text-center py-2 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">Contextual Matching</td>
                    <td className="text-center py-2 px-4">-</td>
                    <td className="text-center py-2 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">Search Speed</td>
                    <td className="text-center py-2 px-4">Very Fast</td>
                    <td className="text-center py-2 px-4">Fast</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">Requires API Key</td>
                    <td className="text-center py-2 px-4">No</td>
                    <td className="text-center py-2 px-4">Yes (Gemini)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
