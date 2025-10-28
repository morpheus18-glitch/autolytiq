import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import dayjs from 'dayjs';
import type { SMSMessage } from '@/types/leads';

interface SMSThreadProps {
  messages: SMSMessage[];
}

export function SMSThread({ messages }: SMSThreadProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">SMS Conversation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col gap-1">
              <div
                className={`inline-flex max-w-[85%] flex-col rounded-2xl px-3 py-2 text-sm shadow-sm ${
                  message.sender === 'agent'
                    ? 'self-end rounded-br-md bg-indigo-600 text-white'
                    : 'self-start rounded-bl-md bg-slate-100 text-slate-700'
                }`}
              >
                <span>{message.body}</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${message.sender === 'agent' ? 'self-end text-indigo-500' : 'self-start text-slate-500'}`}>
                <span>{dayjs(message.timestamp).format('MMM D, h:mm A')}</span>
                {message.status && <Badge variant="outline">{message.status}</Badge>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default SMSThread;
