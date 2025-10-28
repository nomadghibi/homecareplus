import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Clock, Calendar } from 'lucide-react';

export default function RateModifiersTable({ strategy, modifiers }) {
  const getModifierTypeIcon = (type) => {
    if (type === 'weekend' || type === 'holiday') return <Calendar className="w-4 h-4" />;
    if (type === 'evening' || type === 'night') return <Clock className="w-4 h-4" />;
    return null;
  };

  const getModifierTypeColor = (type) => {
    const colors = {
      weekend: 'bg-blue-100 text-blue-800',
      evening: 'bg-purple-100 text-purple-800',
      night: 'bg-indigo-100 text-indigo-800',
      holiday: 'bg-red-100 text-red-800',
      emergency: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatMultiplier = (multiplier) => {
    if (!multiplier) return 'N/A';
    const percentIncrease = ((multiplier - 1) * 100).toFixed(0);
    return `${multiplier}x (+${percentIncrease}%)`;
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDaysOfWeek = (days) => {
    if (!days || days.length === 0) return 'All days';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(d => dayNames[d]).join(', ');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Rate Modifiers</CardTitle>
          <CardDescription>
            Conditional rate adjustments for {strategy?.name}
          </CardDescription>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Modifier
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Multiplier</TableHead>
              <TableHead>Time Range</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modifiers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No rate modifiers configured for this strategy
                </TableCell>
              </TableRow>
            ) : (
              modifiers.map((modifier) => (
                <TableRow key={modifier.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getModifierTypeIcon(modifier.modifier_type)}
                      {modifier.modifier_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getModifierTypeColor(modifier.modifier_type)}>
                      {modifier.modifier_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    {formatMultiplier(modifier.multiplier)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {modifier.start_time || modifier.end_time ? (
                      <>
                        {formatTime(modifier.start_time)} - {formatTime(modifier.end_time)}
                      </>
                    ) : (
                      <span className="text-gray-400">Any time</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDaysOfWeek(modifier.days_of_week)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{modifier.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={modifier.is_active ? "success" : "secondary"}>
                      {modifier.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Modifier Examples */}
        {modifiers.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">Example Calculations</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p>Base rate $35/hr on Saturday: <span className="font-bold">
                ${(35 * (modifiers.find(m => m.modifier_type === 'weekend')?.multiplier || 1)).toFixed(2)}/hr
              </span></p>
              <p>Base rate $35/hr at 9PM: <span className="font-bold">
                ${(35 * (modifiers.find(m => m.modifier_type === 'evening')?.multiplier || 1)).toFixed(2)}/hr
              </span></p>
              <p>Base rate $35/hr on holiday: <span className="font-bold">
                ${(35 * (modifiers.find(m => m.modifier_type === 'holiday')?.multiplier || 1)).toFixed(2)}/hr
              </span></p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
