import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailSettingsTab } from '../components/EmailSettingsTab';
import { SearchSettingsTab } from '../components/SearchSettingsTab';
import { KanbanSettingsTab } from '../components/KanbanSettingsTab';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('email');

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
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
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your email client preferences and configurations
            </p>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-6">
            <EmailSettingsTab />
          </TabsContent>

          <TabsContent value="search" className="mt-6">
            <SearchSettingsTab />
          </TabsContent>

          <TabsContent value="kanban" className="mt-6">
            <KanbanSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
