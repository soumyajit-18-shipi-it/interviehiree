import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../ui/Toast';
import TeamManagement from './TeamManagement';

vi.mock('../../lib/api', () => ({
  ensureOrganizationId: vi.fn().mockResolvedValue('org-1'),
  listTeam: vi.fn().mockResolvedValue({
    count: 1,
    next: null,
    previous: null,
    results: [
      {
        id: 'tm-1',
        first_name: 'Sarah',
        last_name: 'Connor',
        display_name: 'Sarah Connor',
        email: 'sarah@example.com',
        designation: 'Head of Talent',
        user_type: 'Admin',
        status: 'Active',
      },
    ],
  }),
  createTeamMember: vi.fn().mockResolvedValue({ id: 'tm-2' }),
}));

import { createTeamMember, listTeam } from '../../lib/api';

describe('TeamManagement', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads team members and sends invite via API', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TeamManagement />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /invite member/i }));
    await user.type(screen.getByPlaceholderText('Add more emails...'), 'newuser@example.com');
    await user.click(screen.getByRole('button', { name: /send invites/i }));

    await waitFor(() => {
      expect(createTeamMember).toHaveBeenCalledTimes(1);
    });

    expect(createTeamMember).toHaveBeenCalledWith(
      expect.objectContaining({
        organization: 'org-1',
        email: 'newuser@example.com',
      })
    );
  });

  it('shows error toast when team load fails', async () => {
    vi.mocked(listTeam).mockRejectedValueOnce(new Error('load-failed'));

    render(
      <ToastProvider>
        <TeamManagement />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Unable to load team members.')).toBeInTheDocument();
    });
  });

  it('shows error toast when invite request fails', async () => {
    const user = userEvent.setup();
    vi.mocked(createTeamMember).mockRejectedValueOnce(new Error('invite-failed'));

    render(
      <ToastProvider>
        <TeamManagement />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /invite member/i }));
    await user.type(screen.getByPlaceholderText('Add more emails...'), 'newuser@example.com');
    await user.click(screen.getByRole('button', { name: /send invites/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to send invite.')).toBeInTheDocument();
    });
  });
});
