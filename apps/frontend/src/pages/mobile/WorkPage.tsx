import { useState } from 'react';
import { Input, CheckCircle, ChevronRight, PullToRefresh, Text } from '@repo/ui';

interface Task {
  id: string;
  title: string;
  type: 'call' | 'follow-up' | 'delivery' | 'paperwork';
  priority: 'high' | 'normal' | 'low';
  dueDate: string;
  customer?: string;
  vehicle?: string;
  completed: boolean;
}

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Follow up with John Doe',
    type: 'follow-up',
    priority: 'high',
    dueDate: 'Today 2:00 PM',
    customer: 'John Doe',
    completed: false,
  },
  {
    id: '2',
    title: 'Prepare delivery paperwork',
    type: 'paperwork',
    priority: 'high',
    dueDate: 'Today 4:00 PM',
    customer: 'Jane Smith',
    vehicle: '2023 Honda Accord',
    completed: false,
  },
  {
    id: '3',
    title: 'Call Bob Johnson re: financing',
    type: 'call',
    priority: 'normal',
    dueDate: 'Tomorrow 10:00 AM',
    customer: 'Bob Johnson',
    completed: false,
  },
];

const taskTypeColors = {
  call: 'bg-blue-500',
  'follow-up': 'bg-purple-500',
  delivery: 'bg-green-500',
  paperwork: 'bg-orange-500',
};

export function WorkPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const filteredTasks = tasks.filter((t) =>
    `${t.title} ${t.customer} ${t.vehicle}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const incompleteTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <div className="min-h-screen bg-bg-0">
        {/* iOS-style large title header */}
        <div className="sticky top-0 z-20 bg-bg-0/95 backdrop-blur-xl">
          <div className="px-4 pt-4 pb-3">
            <Text as="h1" variant="largeTitle" color="primary" className="mb-1">
              Work
            </Text>
            <Text variant="subheadline" color="secondary" className="mb-4 opacity-70">
              Tasks and appointments
            </Text>

            {/* iOS-style search bar */}
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-bg-2/80 border-0 rounded-xl px-3 text-[17px] placeholder:text-text-muted/50 focus:bg-bg-2"
            />
          </div>
          <div className="h-px bg-border-base/20" />
        </div>

        {/* Task list */}
        <div className="px-4 py-2">
          {/* Incomplete tasks */}
          {incompleteTasks.length > 0 && (
            <>
              {incompleteTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="w-full"
                >
                  {/* iOS-style list row */}
                  <div className="bg-bg-1 active:bg-bg-2/50 transition-colors">
                    <div className="px-4 py-3 min-h-[68px] flex items-center gap-3">
                      {/* Task type dot */}
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${taskTypeColors[task.type]}`} />

                      {/* Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <Text as="h3" variant="bodySemibold" color="primary">
                            {task.title}
                          </Text>
                          <Text variant="footnote" color="secondary" className="ml-auto flex-shrink-0">
                            {task.dueDate}
                          </Text>
                        </div>
                        {task.customer && (
                          <Text variant="subheadline" color="secondary" className="mb-1 opacity-80">
                            {task.customer}
                          </Text>
                        )}
                        {task.vehicle && (
                          <Text variant="footnote" color="tertiary" className="opacity-60">
                            {task.vehicle}
                          </Text>
                        )}
                      </div>

                      {/* Chevron */}
                      <ChevronRight className="w-5 h-5 text-text-muted/30 flex-shrink-0" />
                    </div>

                    {/* Inset separator */}
                    <div className="h-px bg-border-base/20 ml-14" />
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Completed tasks */}
          {completedTasks.length > 0 && (
            <div className="mt-6">
              <Text as="h3" variant="footnoteSemibold" color="secondary" className="opacity-70 uppercase tracking-wide px-4 mb-2">
                Completed
              </Text>
              {completedTasks.map((task, index) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="w-full"
                >
                  {/* iOS-style list row - completed */}
                  <div className="bg-bg-1 active:bg-bg-2/50 transition-colors opacity-50">
                    <div className="px-4 py-3 min-h-[68px] flex items-center gap-3">
                      {/* Checkmark */}
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />

                      {/* Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <Text as="h3" variant="bodySemibold" color="primary" className="line-through">
                          {task.title}
                        </Text>
                      </div>

                      {/* Chevron */}
                      <ChevronRight className="w-5 h-5 text-text-muted/30 flex-shrink-0" />
                    </div>

                    {/* Inset separator */}
                    {index < completedTasks.length - 1 && (
                      <div className="h-px bg-border-base/20 ml-14" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Empty state */}
        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 rounded-full bg-bg-2 flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-text-muted/40" />
            </div>
            <Text as="h3" variant="title3" color="primary" className="mb-1">
              All Caught Up
            </Text>
            <Text variant="subheadline" color="secondary" align="center" className="opacity-70 max-w-[280px]">
              No tasks found
            </Text>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
