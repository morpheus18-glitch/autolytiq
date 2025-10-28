import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Clock,
  PlayCircle,
  CheckCircle,
  Award,
  Calendar,
  Search,
  Filter,
  Plus,
  BarChart3,
  FileText,
  Video,
  Download
} from "lucide-react";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'video' | 'document' | 'quiz' | 'interactive';
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completions: number;
  rating: number;
  isRequired: boolean;
  createdAt: string;
}

interface UserProgress {
  userId: string;
  userName: string;
  role: string;
  completedModules: number;
  totalModules: number;
  completionRate: number;
  lastActivity: string;
  certifications: string[];
}

export default function TrainingCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Mock training modules - would be fetched from backend
  const trainingModules: TrainingModule[] = [
    {
      id: '1',
      title: 'Customer Service Excellence',
      description: 'Learn the fundamentals of providing exceptional customer service in automotive sales',
      category: 'Customer Service',
      type: 'video',
      duration: 45,
      difficulty: 'beginner',
      completions: 28,
      rating: 4.8,
      isRequired: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'F&I Compliance Training',
      description: 'Understanding legal requirements and best practices for finance and insurance',
      category: 'Compliance',
      type: 'interactive',
      duration: 90,
      difficulty: 'advanced',
      completions: 15,
      rating: 4.6,
      isRequired: true,
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      title: 'Digital Sales Tools Mastery',
      description: 'Master the use of digital tools and CRM systems for modern automotive sales',
      category: 'Technology',
      type: 'interactive',
      duration: 60,
      difficulty: 'intermediate',
      completions: 22,
      rating: 4.7,
      isRequired: false,
      createdAt: '2024-01-08'
    },
    {
      id: '4',
      title: 'Vehicle Knowledge: 2024 Models',
      description: 'Comprehensive overview of all 2024 vehicle models and their features',
      category: 'Product Knowledge',
      type: 'document',
      duration: 120,
      difficulty: 'intermediate',
      completions: 20,
      rating: 4.5,
      isRequired: true,
      createdAt: '2024-01-05'
    },
    {
      id: '5',
      title: 'Sales Objection Handling',
      description: 'Effective techniques for handling customer objections and closing deals',
      category: 'Sales Techniques',
      type: 'video',
      duration: 75,
      difficulty: 'intermediate',
      completions: 25,
      rating: 4.9,
      isRequired: false,
      createdAt: '2024-01-03'
    }
  ];

  // Mock user progress data
  const userProgress: UserProgress[] = [
    {
      userId: '1',
      userName: 'Sarah Johnson',
      role: 'Sales Consultant',
      completedModules: 8,
      totalModules: 10,
      completionRate: 80,
      lastActivity: '2025-01-29',
      certifications: ['Customer Service', 'Sales Excellence']
    },
    {
      userId: '2',
      userName: 'Mike Davis',
      role: 'F&I Manager',
      completedModules: 12,
      totalModules: 12,
      completionRate: 100,
      lastActivity: '2025-01-28',
      certifications: ['F&I Compliance', 'Advanced Sales', 'Customer Service']
    },
    {
      userId: '3',
      userName: 'Lisa Chen',
      role: 'Sales Manager',
      completedModules: 9,
      totalModules: 12,
      completionRate: 75,
      lastActivity: '2025-01-27',
      certifications: ['Sales Management', 'Customer Service']
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'quiz': return <CheckCircle className="w-4 h-4" />;
      case 'interactive': return <PlayCircle className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredModules = trainingModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesType = selectedType === 'all' || module.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = [...new Set(trainingModules.map(m => m.category))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Training Center</h1>
            <p className="text-gray-600">Develop skills and certifications for your team</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Module
          </Button>
        </div>
      </div>

      {/* Training Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Modules</p>
                <p className="text-2xl font-bold">{trainingModules.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Learners</p>
                <p className="text-2xl font-bold">{userProgress.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion</p>
                <p className="text-2xl font-bold">{Math.round(userProgress.reduce((sum, u) => sum + u.completionRate, 0) / userProgress.length)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Certifications</p>
                <p className="text-2xl font-bold">{userProgress.reduce((sum, u) => sum + u.certifications.length, 0)}</p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="progress">Team Progress</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search training modules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border rounded-md px-3 py-2"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select 
                    value={selectedType} 
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="border rounded-md px-3 py-2"
                  >
                    <option value="all">All Types</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                    <option value="quiz">Quiz</option>
                    <option value="interactive">Interactive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(module.type)}
                      <Badge variant="outline" className="capitalize">
                        {module.type}
                      </Badge>
                    </div>
                    {module.isRequired && (
                      <Badge className="bg-red-100 text-red-800">Required</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Category:</span>
                      <Badge variant="outline">{module.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Duration:</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{module.duration} min</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Difficulty:</span>
                      <Badge className={getDifficultyColor(module.difficulty)}>
                        {module.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Completions:</span>
                      <span>{module.completions} users</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Rating:</span>
                      <div className="flex items-center gap-1">
                        <span>{module.rating}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(module.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Module
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Training Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userProgress.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">{user.userName}</div>
                          <div className="text-sm text-gray-600">{user.role}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{user.completionRate}%</div>
                          <div className="text-sm text-gray-600">{user.completedModules}/{user.totalModules} modules</div>
                        </div>
                      </div>
                      <Progress value={user.completionRate} className="mb-2" />
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Last activity: {new Date(user.lastActivity).toLocaleDateString()}</span>
                        <span>{user.certifications.length} certifications</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certifications Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Customer Service', 'F&I Compliance', 'Sales Excellence', 'Advanced Sales', 'Sales Management'].map((cert) => (
                  <div key={cert} className="border rounded-lg p-4 text-center">
                    <Award className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                    <h3 className="font-medium mb-2">{cert}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {userProgress.filter(u => u.certifications.includes(cert)).length} certified users
                    </p>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}