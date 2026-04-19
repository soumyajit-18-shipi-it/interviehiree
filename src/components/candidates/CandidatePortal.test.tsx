import { render, screen, waitFor } from '@testing-library/react';
import { ToastProvider } from '../ui/Toast';
import CandidatePortal from './CandidatePortal';

vi.mock('../../lib/api', () => ({
  ensureOrganizationId: vi.fn().mockResolvedValue('org-1'),
  getCareerPageSetup: vi.fn().mockResolvedValue({ slug: 'careers' }),
  getCareerPageDetails: vi.fn().mockResolvedValue({
    slug: 'careers',
    headline: 'Join our engineering team',
    subheadline: 'Build reliable APIs with us.',
    brand_color: '#1258F6',
  }),
  getCareerPageJobs: vi.fn().mockResolvedValue({
    count: 1,
    next: null,
    previous: null,
    results: [
      {
        id: 'job-1',
        title: 'Backend Engineer',
        role: 'Engineering',
        location: 'Remote',
        description: 'Build APIs',
      },
    ],
  }),
  listJobs: vi.fn().mockResolvedValue({ count: 0, next: null, previous: null, results: [] }),
}));

describe('CandidatePortal', () => {
  it('loads jobs from career page APIs', async () => {
    const { container } = render(
      <ToastProvider>
        <CandidatePortal />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
      expect(screen.getByText('Build APIs')).toBeInTheDocument();
    });

    expect(container.firstElementChild).toHaveAttribute('style', expect.stringContaining('--primary: #1258F6'));
  });
});
