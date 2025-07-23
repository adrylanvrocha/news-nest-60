import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  Globe, 
  Mail, 
  Shield, 
  Database,
  Save,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Site Configuration
  const [siteConfig, setSiteConfig] = useState({
    siteName: "Portal de Notícias",
    siteDescription: "Seu portal de notícias confiável",
    siteUrl: "https://meuportal.com",
    contactEmail: "contato@meuportal.com",
    logo: "",
    favicon: "",
  });

  // Content Settings
  const [contentSettings, setContentSettings] = useState({
    allowComments: true,
    moderateComments: true,
    autoPublishArticles: false,
    featuredArticlesLimit: 5,
    articlesPerPage: 10,
    enableNewsletter: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    allowAnonymousComments: false,
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "",
    enableEmailNotifications: true,
  });

  const handleSaveSiteConfig = async () => {
    setLoading(true);
    try {
      // Here you would save to your backend/database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do site foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContentSettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações de conteúdo salvas",
        description: "As configurações de conteúdo foram atualizadas.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações de conteúdo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecuritySettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações de segurança salvas",
        description: "As configurações de segurança foram atualizadas.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações de segurança.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Cache limpo",
        description: "O cache do sistema foi limpo com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao limpar cache",
        description: "Ocorreu um erro ao limpar o cache.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Configurações">
      <div className="space-y-6">
        {/* Site Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Configurações Gerais do Site
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nome do Site</Label>
                <Input
                  id="siteName"
                  value={siteConfig.siteName}
                  onChange={(e) => setSiteConfig({ ...siteConfig, siteName: e.target.value })}
                  placeholder="Nome do seu site"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">URL do Site</Label>
                <Input
                  id="siteUrl"
                  value={siteConfig.siteUrl}
                  onChange={(e) => setSiteConfig({ ...siteConfig, siteUrl: e.target.value })}
                  placeholder="https://meusite.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Descrição do Site</Label>
              <Textarea
                id="siteDescription"
                value={siteConfig.siteDescription}
                onChange={(e) => setSiteConfig({ ...siteConfig, siteDescription: e.target.value })}
                placeholder="Descrição do seu site..."
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email de Contato</Label>
              <Input
                id="contactEmail"
                type="email"
                value={siteConfig.contactEmail}
                onChange={(e) => setSiteConfig({ ...siteConfig, contactEmail: e.target.value })}
                placeholder="contato@meusite.com"
              />
            </div>
            
            <Button onClick={handleSaveSiteConfig} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações Gerais
            </Button>
          </CardContent>
        </Card>

        {/* Content Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Configurações de Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Permitir Comentários</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que usuários comentem em artigos
                  </p>
                </div>
                <Switch
                  checked={contentSettings.allowComments}
                  onCheckedChange={(checked) => 
                    setContentSettings({ ...contentSettings, allowComments: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Moderar Comentários</Label>
                  <p className="text-sm text-muted-foreground">
                    Comentários precisam ser aprovados antes de aparecer
                  </p>
                </div>
                <Switch
                  checked={contentSettings.moderateComments}
                  onCheckedChange={(checked) => 
                    setContentSettings({ ...contentSettings, moderateComments: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Publicação Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Artigos são publicados automaticamente quando criados
                  </p>
                </div>
                <Switch
                  checked={contentSettings.autoPublishArticles}
                  onCheckedChange={(checked) => 
                    setContentSettings({ ...contentSettings, autoPublishArticles: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Habilitar Newsletter</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que usuários se inscrevam na newsletter
                  </p>
                </div>
                <Switch
                  checked={contentSettings.enableNewsletter}
                  onCheckedChange={(checked) => 
                    setContentSettings({ ...contentSettings, enableNewsletter: checked })
                  }
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="featuredLimit">Limite de Artigos em Destaque</Label>
                <Input
                  id="featuredLimit"
                  type="number"
                  value={contentSettings.featuredArticlesLimit}
                  onChange={(e) => 
                    setContentSettings({ 
                      ...contentSettings, 
                      featuredArticlesLimit: parseInt(e.target.value) || 5 
                    })
                  }
                  min="1"
                  max="20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="articlesPerPage">Artigos por Página</Label>
                <Input
                  id="articlesPerPage"
                  type="number"
                  value={contentSettings.articlesPerPage}
                  onChange={(e) => 
                    setContentSettings({ 
                      ...contentSettings, 
                      articlesPerPage: parseInt(e.target.value) || 10 
                    })
                  }
                  min="5"
                  max="50"
                />
              </div>
            </div>
            
            <Button onClick={handleSaveContentSettings} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações de Conteúdo
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configurações de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Verificação de Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Usuários devem verificar email antes de fazer login
                  </p>
                </div>
                <Switch
                  checked={securitySettings.requireEmailVerification}
                  onCheckedChange={(checked) => 
                    setSecuritySettings({ ...securitySettings, requireEmailVerification: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">
                    Requer 2FA para contas administrativas
                  </p>
                </div>
                <Switch
                  checked={securitySettings.enableTwoFactor}
                  onCheckedChange={(checked) => 
                    setSecuritySettings({ ...securitySettings, enableTwoFactor: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Comentários Anônimos</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite comentários sem login
                  </p>
                </div>
                <Switch
                  checked={securitySettings.allowAnonymousComments}
                  onCheckedChange={(checked) => 
                    setSecuritySettings({ ...securitySettings, allowAnonymousComments: checked })
                  }
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Timeout de Sessão (minutos)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => 
                    setSecuritySettings({ 
                      ...securitySettings, 
                      sessionTimeout: parseInt(e.target.value) || 30 
                    })
                  }
                  min="5"
                  max="480"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Máximo de Tentativas de Login</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => 
                    setSecuritySettings({ 
                      ...securitySettings, 
                      maxLoginAttempts: parseInt(e.target.value) || 5 
                    })
                  }
                  min="3"
                  max="10"
                />
              </div>
            </div>
            
            <Button onClick={handleSaveSecuritySettings} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações de Segurança
            </Button>
          </CardContent>
        </Card>

        {/* System Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Manutenção do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Cache do Sistema</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Limpe o cache para garantir que as alterações sejam refletidas no site.
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleClearCache} 
                  disabled={loading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Limpar Cache
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Backup de Dados</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Faça backup regular dos dados do sistema.
                </p>
                <Button variant="outline">
                  <Database className="mr-2 h-4 w-4" />
                  Gerar Backup
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Logs do Sistema</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Visualize e faça download dos logs do sistema.
                </p>
                <Button variant="outline">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Ver Logs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}