import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../ui/Toast';
import ApplicationForm from './ApplicationForm';

vi.mock('../../lib/api', () => ({
  createCandidate: vi.fn().mockResolvedValue({ id: 'cand-1' }),
  createApplication: vi.fn().mockResolvedValue({ id: 'app-1' }),
}));

import { createApplication, createCandidate } from '../../lib/api';

describe('ApplicationForm', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('submits candidate and application using integrated APIs', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ApplicationForm
          jobTitle="Senior Product Designer"
          jobId="job-123"
          organizationId="org-456"
          onSuccess={vi.fn()}
        />
      </ToastProvider>
    );

    await user.type(screen.getByPlaceholderText('John Doe'), 'Jane Doe');
    await user.type(screen.getByPlaceholderText('john@example.com'), 'jane@example.com');
    await user.type(screen.getByPlaceholderText('+1 (555) 000-0000'), '+1 (555) 111-2222');

    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
    const uploadInput = document.querySelector('#resume-upload') as HTMLInputElement;
    await user.upload(uploadInput, file);

    await user.click(screen.getByRole('button', { name: /submit application for senior product designer/i }));

    await waitFor(() => {
      expect(createCandidate).toHaveBeenCalledTimes(1);
      expect(createApplication).toHaveBeenCalledTimes(1);
    });

    expect(createCandidate).toHaveBeenCalledWith(
      expect.objectContaining({
        organization: 'org-456',
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1 (555) 111-2222',
      })
    );
    expect(createApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        organization: 'org-456',
        job: 'job-123',
        candidate: 'cand-1',
      })
    );
  });
});
