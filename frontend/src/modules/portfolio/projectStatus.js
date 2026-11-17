// How a project's status is shown: the badge text and colours, and what it means in plain words.
export const STATUS = {
    live: { label: 'LIVE', className: 'text-cyber-active border-cyber-active/40' },
    soon: { label: 'COMING SOON', className: 'text-cyber-muted border-cyber-border' },
    paused: { label: 'ON HOLD', className: 'text-cyber-beta border-cyber-beta/40' },
};

// Whether to say "PRIVATE REPO" for a project with no public repo. Not for a project that is not code at all
// (`noRepo: true`, e.g. the home lab): there is no repo to be private.
export const showPrivateRepo = (project) => !project.repo && !project.noRepo;
