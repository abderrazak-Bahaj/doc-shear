import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const ViewLink = ({ docSelected, setDocSeleced }: { docSelected: any; setDocSeleced: any }) => {
  const isOneTime = docSelected?.privacy === 'one-time';

  return (
    <Dialog open={!!docSelected} onOpenChange={open => !open && setDocSeleced(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Copy Link</DialogTitle>
          <DialogDescription>
            copy the link below to share the document with others.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Title</label>
            <Input value={docSelected?.title} readOnly />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isOneTime ? 'One-time View Link' : 'Shared View Link'}
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={`${window.location.origin}/${
                  isOneTime ? 'one-time' : 'shared'
                }/${docSelected?.publicSlug}`}
                readOnly
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/${
                      isOneTime ? 'one-time' : 'shared'
                    }/${docSelected?.publicSlug}`
                  );
                  toast({
                    title: 'Success',
                    description: 'Link copied to clipboard',
                  });
                }}
              >
                Copy
              </Button>
            </div>

            {isOneTime && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Key</label>
                  <div className="flex items-center gap-2">
                    <Input value={docSelected?.oneTimeKey} readOnly />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(docSelected?.oneTimeKey);
                        toast({
                          title: 'Success',
                          description: 'Key copied to clipboard',
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share this link with someone. The document will be deleted after it&apos;s viewed.
                </p>
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDocSeleced(null);
            }}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewLink;
