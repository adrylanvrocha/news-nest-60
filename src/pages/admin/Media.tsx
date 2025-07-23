import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Search, Trash2, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MediaFile {
  id?: string;
  name: string;
  size?: number;
  created_at?: string;
  updated_at?: string;
  metadata?: any;
}

export default function Media() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage.from('media').list('', {
        limit: 100,
        offset: 0,
      });

      if (error) throw error;

      setFiles(data || []);
    } catch (error: any) {
      console.error("Error fetching files:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar arquivos",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (error) throw error;

      toast({
        title: "Arquivo enviado",
        description: "O arquivo foi enviado com sucesso.",
      });

      fetchFiles();
    } catch (error: any) {
      console.error("Error uploading file:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao enviar arquivo",
        description: error.message,
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([fileName]);

      if (error) throw error;

      toast({
        title: "Arquivo removido",
        description: "O arquivo foi removido com sucesso.",
      });

      fetchFiles();
    } catch (error: any) {
      console.error("Error deleting file:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao remover arquivo",
        description: error.message,
      });
    }
  };

  const getFileUrl = (fileName: string) => {
    const { data } = supabase.storage.from('media').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImage = (fileName: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Gerenciar Mídia">
      <div className="space-y-6">
        {/* Header with upload and search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar arquivos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
              accept="image/*,video/*,audio/*,.pdf"
            />
            <Button 
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Enviando..." : "Enviar Arquivo"}
            </Button>
          </div>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={`loading-${index}`} className="h-64">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="bg-muted h-32 rounded mb-4"></div>
                    <div className="bg-muted h-4 rounded mb-2"></div>
                    <div className="bg-muted h-3 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <Card key={file.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="p-3">
                  <div className="aspect-square bg-muted rounded-md overflow-hidden mb-2">
                    {isImage(file.name) ? (
                      <img
                        src={getFileUrl(file.name)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-2xl font-bold text-muted-foreground">
                          {file.name.split('.').pop()?.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-3 pt-0">
                  <CardTitle className="text-sm truncate mb-1">{file.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mb-3">
                    {file.size ? formatFileSize(file.size) : "Tamanho desconhecido"}
                  </p>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getFileUrl(file.name), '_blank')}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = getFileUrl(file.name);
                        link.download = file.name;
                        link.click();
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir este arquivo?")) {
                          handleDeleteFile(file.name);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Nenhum arquivo encontrado
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Comece enviando alguns arquivos de mídia
              </p>
              <Button 
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Enviar Primeiro Arquivo
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}