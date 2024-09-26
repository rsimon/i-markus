import { FileBarChart2 } from 'lucide-react';
import { exportFolderMetadataCSV, exportFolderMetadataExcel, exportImageMetadataCSV, useStore } from '@/store';
import { Button } from '@/ui/Button';

export const ExportMetadata = () => {

  const store = useStore();

  return (
    <ul className="py-2">
      <li>
        <div className="max-w-xl py-2">
          <h3 className="font-medium mb-1 leading-relaxed">
            Image Metadata
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            Image metadata as a flat list in CSV spreadsheet format. One row per image, one column per metadata 
            schema field.
          </p>

          <Button 
            className="whitespace-nowrap flex gap-3 w-36"
            onClick={() => exportImageMetadataCSV(store)}>
            <FileBarChart2 className="h-4 w-4" /> CSV
          </Button>
        </div>
      </li>

      <li>
        <div className="max-w-xl pt-16">
          <h3 className="font-medium mb-1 leading-relaxed">
            Folder Metadata
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            Folder metadata as a flat list in CSV spreadsheet format. One row per folder, one column per metadata 
            schema field.
          </p>

          <div className="flex gap-2">
            <Button 
              className="whitespace-nowrap flex gap-3 w-36"
              onClick={() => exportFolderMetadataCSV(store)}>
              <FileBarChart2 className="h-4 w-4" /> CSV
            </Button>

            <Button
              className="whitespace-nowrap flex gap-3 w-36"
              onClick={() => exportFolderMetadataExcel(store)}>
              <FileBarChart2 className="h-5 w-5" /> XLSX
            </Button>
          </div>
        </div>
      </li>
    </ul>
  )

}