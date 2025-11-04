import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Image as ImageIcon,
  Video,
  File,
  Plus,
  Grid,
  List,
  Tag
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MediaItem {
  id?: string;
  url: string;
  label: string;
  type: 'image' | 'video' | 'document';
  tags?: string[];
  uploadedAt?: string;
  fileSize?: number;
  dimensions?: { width: number; height: number };
}

interface MediaGalleryProps {
  media: MediaItem[];
  onUpload?: (files: FileList) => void;
  onDelete?: (mediaId: string) => void;
  onUpdateTags?: (mediaId: string, tags: string[]) => void;
  onReorder?: (from: number, to: number) => void;
  editable?: boolean;
  viewMode?: 'grid' | 'list';
}

export default function MediaGallery({ 
  media, 
  onUpload, 
  onDelete, 
  onUpdateTags, 
  onReorder, 
  editable = false,
  viewMode = 'grid'
}: MediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>(viewMode);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-green-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-blue-600" />;
      case 'document':
        return <File className="w-5 h-5 text-red-600" />;
      default:
        return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && onUpload) {
      onUpload(files);
    }
  };

  const handleAddTag = (mediaId: string) => {
    if (newTag.trim() && onUpdateTags) {
      const mediaItem = media.find(m => m.id === mediaId);
      if (mediaItem) {
        const updatedTags = [...(mediaItem.tags || []), newTag.trim()];
        onUpdateTags(mediaId, updatedTags);
        setNewTag('');
      }
    }
  };

  const handleRemoveTag = (mediaId: string, tagToRemove: string) => {
    if (onUpdateTags) {
      const mediaItem = media.find(m => m.id === mediaId);
      if (mediaItem) {
        const updatedTags = (mediaItem.tags || []).filter(tag => tag !== tagToRemove);
        onUpdateTags(mediaId, updatedTags);
      }
    }
  };

  const openFullscreen = (index: number) => {
    setCurrentIndex(index);
    setSelectedMedia(media[index]);
    setIsFullscreen(true);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % media.length;
    setCurrentIndex(nextIndex);
    setSelectedMedia(media[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + media.length) % media.length;
    setCurrentIndex(prevIndex);
    setSelectedMedia(media[prevIndex]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />
            Media Gallery ({media.length})
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            >
              {view === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
            {editable && (
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {media.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No media files available</p>
            {editable && (
              <div className="relative inline-block">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Media
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 gap-4' : 'space-y-4'}>
            {media.map((item, index) => (
              <div key={item.id || index} className={view === 'grid' ? 'space-y-2' : 'flex items-center space-x-4 p-4 border rounded-lg'}>
                {view === 'grid' ? (
                  <>
                    <div className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={item.label}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => openFullscreen(index)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center cursor-pointer">
                            {getFileIcon(item.type)}
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white hover:text-black"
                            onClick={() => openFullscreen(index)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {editable && onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-red-500"
                              onClick={() => onDelete(item.id!)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {getFileIcon(item.type)}
                        <span>{item.type}</span>
                        {item.fileSize && <span>{formatFileSize(item.fileSize)}</span>}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-shrink-0">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.label}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                          onClick={() => openFullscreen(index)}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(item.type)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{item.label}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <span className="capitalize">{item.type}</span>
                        {item.fileSize && <span>• {formatFileSize(item.fileSize)}</span>}
                        {item.dimensions && (
                          <span>• {item.dimensions.width}x{item.dimensions.height}</span>
                        )}
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags?.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                            {editable && editingTags === item.id && (
                              <X
                                className="w-3 h-3 ml-1 cursor-pointer"
                                onClick={() => handleRemoveTag(item.id!, tag)}
                              />
                            )}
                          </Badge>
                        ))}
                        {editable && editingTags === item.id && (
                          <div className="flex items-center space-x-1">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Add tag..."
                              className="w-20 h-6 text-xs"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddTag(item.id!)}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddTag(item.id!)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {editable && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTags(editingTags === item.id ? null : item.id!)}
                        >
                          <Tag className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openFullscreen(index)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item.id!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Fullscreen Dialog */}
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedMedia?.label}</DialogTitle>
            </DialogHeader>
            <div className="relative">
              {selectedMedia?.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.label}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                  {getFileIcon(selectedMedia?.type || 'document')}
                  <p className="ml-2">{selectedMedia?.label}</p>
                </div>
              )}
              
              {media.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              {currentIndex + 1} of {media.length}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}