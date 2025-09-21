import { Download } from 'lucide-react';

export default function Placeholder() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Download className="h-8 w-8 text-orange-500" />
        </div>
        <p className="text-gray-600">Select a section from the sidebar</p>
      </div>
    </div>
  );
}
