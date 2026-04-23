import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  createCareerPageSetup,
  ensureOrganizationId,
  getCareerPageSetup,
  listCareerPageMedia,
  uploadCareerPageMedia,
  updateCareerPageSetup,
} from '../../lib/api';
import { useToast } from '../ui/Toast';

interface CareerPageSetupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CareerPageSetup({ isOpen, onClose }: CareerPageSetupProps) {
  const { toast } = useToast();
  const [organizationId, setOrganizationId] = useState('');
  
  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [subheadline, setSubheadline] = useState(''); // using this for Description
  
  const [brandColor, setBrandColor] = useState('#6B46FF');
  const [headline, setHeadline] = useState('Join us in building the future.');
  const [setupExists, setSetupExists] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const loadMedia = async (nextSlug: string) => {
    if (!nextSlug.trim()) {
      return;
    }
    try {
      await listCareerPageMedia(nextSlug, { page_size: 100 });
      // We don't display media list in the new UI, so we just fetch it or omit it
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadSetup = async () => {
      try {
        const orgId = await ensureOrganizationId();
        setOrganizationId(orgId);
        const setup = await getCareerPageSetup(orgId);
        
        setBrandColor(setup.brand_color || '#6B46FF');
        setHeadline(setup.headline || headline);
        setSubheadline(setup.subheadline || subheadline);
        setSlug(setup.slug || slug);
        setSetupExists(true);
        if (setup.slug) {
          await loadMedia(setup.slug);
        }
      } catch {
        setSetupExists(false);
      }
    };

    loadSetup();
  }, [isOpen]);

  const saveSetup = async () => {
    try {
      if (!organizationId) {
        toast('Organization is missing. Please refresh and try again.', 'error');
        return;
      }
      if (!slug.trim()) {
        toast('Domain (slug) cannot be blank.', 'error');
        return;
      }
      
      const payload = {
        headline,
        subheadline, // storing description here
        slug: slug.trim(),
        is_live: true,
        brand_color: brandColor,
      };

      if (setupExists) {
        await updateCareerPageSetup(organizationId, payload);
      } else {
        await createCareerPageSetup({
          organization: organizationId,
          ...payload
        });
      }

      if (selectedLogo) {
        setIsUploadingLogo(true);
        await uploadCareerPageMedia(slug.trim(), {
          media_type: 'logo',
          title: `${companyName || 'Company'} Logo`,
          media_file: selectedLogo,
          alt_text: `${companyName || 'Company'} logo`,
          order: 0,
          is_active: true,
        });
      }

      setSelectedLogo(null);
      toast('Career page settings saved.', 'success');
      onClose();
    } catch (error) {
      console.error(error);
      toast('Unable to save career page settings.', 'error');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="px-8 pt-8 pb-4 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Setup {companyName ? `${companyName}'s` : "Organization's"} Career Page
              </h2>
              <p className="text-sm text-gray-500 max-w-lg mx-auto">
                Provide the details below to set up a fully customized, AI-powered career page for your organization.
              </p>
            </div>

            <div className="px-8 py-2 space-y-5 overflow-y-auto max-h-[65vh]">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1.5">Organization Name</label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46FF]/50 focus:border-[#6B46FF] text-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1.5">Enter Domain</label>
                  <input 
                    type="text" 
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46FF]/50 focus:border-[#6B46FF] text-gray-900 text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1.5">Organization Contact Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46FF]/50 focus:border-[#6B46FF] text-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1.5">Organization Website Link</label>
                  <input 
                    type="url" 
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46FF]/50 focus:border-[#6B46FF] text-gray-900 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1.5">Organization Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46FF]/50 focus:border-[#6B46FF] text-gray-900 text-sm"
                  />
                </div>
                <div></div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1.5">Organization Logo</label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-1.5 border border-gray-400 bg-gray-50 text-gray-800 rounded flex items-center cursor-pointer hover:bg-gray-100 text-sm font-medium transition-colors">
                    Choose file
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => setSelectedLogo(e.target.files?.[0] || null)}
                      className="hidden" 
                    />
                  </label>
                  <span className="text-sm text-gray-500">
                    {selectedLogo ? selectedLogo.name : "No file chosen"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1.5">Organization Description</label>
                <textarea 
                  rows={4}
                  value={subheadline}
                  onChange={e => setSubheadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B46FF]/50 focus:border-[#6B46FF] text-gray-900 text-sm resize-none"
                />
              </div>

              {slug && (
                <div className="p-3 bg-[#F0FDF4] text-[#15803D] text-sm rounded-md font-medium text-center border border-[#DCFCE7]">
                  Career page will be live on <span className="font-semibold">{slug}.ai/jobs</span>
                </div>
              )}
              {/* Note: if slug is empty, we should still show the banner but empty */}
              {!slug && (
                 <div className="p-3 bg-[#F0FDF4] text-[#15803D] text-sm rounded-md font-medium text-center border border-[#DCFCE7]">
                  Career page will be live on <span className="font-semibold">your-domain.ai/jobs</span>
                </div>
              )}
            </div>

            <div className="px-8 pb-8 pt-4">
              <button 
                onClick={saveSetup}
                disabled={isUploadingLogo}
                className="w-full py-3 bg-[#6B46FF] hover:bg-[#5A3AE0] text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingLogo ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
