
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DivisionHead {
  id: string;
  user_id: string;
  division: string;
  display_name: string;
  created_at: string;
}

interface DivisionHeadManagerProps {
  isAdmin: boolean;
}

const DivisionHeadManager: React.FC<DivisionHeadManagerProps> = ({ isAdmin }) => {
  const [divisionHeads, setDivisionHeads] = useState<DivisionHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    user_id: '',
    division: '',
    display_name: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const divisions = ['Apex Legends', 'Valorant', 'Call of Duty', 'Siege X', 'Call of Duty Mobile'];

  useEffect(() => {
    fetchDivisionHeads();
  }, []);

  const fetchDivisionHeads = async () => {
    try {
      const { data, error } = await supabase
        .from('division_heads')
        .select('*')
        .order('division');

      if (error) throw error;
      setDivisionHeads(data || []);
    } catch (error) {
      console.error('Error fetching division heads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingId) {
        const { error } = await supabase
          .from('division_heads')
          .update({
            division: formData.division,
            display_name: formData.display_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        
        toast({
          title: "Division head updated successfully",
          description: "The division head information has been updated.",
        });
      } else {
        const { error } = await supabase
          .from('division_heads')
          .insert({
            user_id: formData.user_id,
            division: formData.division,
            display_name: formData.display_name,
            created_by: user.id
          });

        if (error) throw error;

        toast({
          title: "Division head added successfully",
          description: "The new division head has been added.",
        });
      }

      setFormData({ user_id: '', division: '', display_name: '' });
      setIsAddingNew(false);
      setEditingId(null);
      fetchDivisionHeads();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (divisionHead: DivisionHead) => {
    setFormData({
      user_id: divisionHead.user_id,
      division: divisionHead.division,
      display_name: divisionHead.display_name
    });
    setEditingId(divisionHead.id);
    setIsAddingNew(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('division_heads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Division head removed",
        description: "The division head has been removed successfully.",
      });

      fetchDivisionHeads();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({ user_id: '', division: '', display_name: '' });
    setIsAddingNew(false);
    setEditingId(null);
  };

  if (!isAdmin) return null;

  if (loading) {
    return <div className="text-gray-400">Loading division heads...</div>;
  }

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Manage Division Heads</h3>
        {!isAddingNew && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add Division Head
          </button>
        )}
      </div>

      {isAddingNew && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                User ID
              </label>
              <input
                type="text"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                placeholder="Enter user UUID"
                required
                disabled={!!editingId}
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Division
              </label>
              <select
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                required
              >
                <option value="">Select Division</option>
                {divisions.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                placeholder="Enter display name"
                required
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
            >
              <Save size={16} className="mr-2" />
              {editingId ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
            >
              <X size={16} className="mr-2" />
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {divisionHeads.map((divisionHead) => (
          <div key={divisionHead.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <div>
              <h4 className="text-white font-medium">{divisionHead.display_name}</h4>
              <p className="text-gray-400 text-sm">{divisionHead.division}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(divisionHead)}
                className="text-blue-400 hover:text-blue-300 p-2 hover:bg-gray-700 rounded transition-colors"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(divisionHead.id)}
                className="text-red-400 hover:text-red-300 p-2 hover:bg-gray-700 rounded transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {divisionHeads.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No division heads assigned yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default DivisionHeadManager;
