import type { Step } from 'react-joyride';

export const videoCallTourSteps: Step[] = [
    {
        target: '[data-tour="video-call-container"]',
        content: 'Welcome to the Video Call feature! This is where you can have face-to-face conversations with investors and entrepreneurs. Let\'s take a quick tour of the controls.',
        title: 'Video Call',
        placement: 'center',
    },
    {
        target: '[data-tour="local-video"]',
        content: 'This is your video preview. You can see how you appear to others before and during the call.',
        title: 'Your Camera',
        placement: 'top',
    },
    {
        target: '[data-tour="remote-video"]',
        content: 'The main video area shows the person you\'re talking to. Click and drag the picture-in-picture to move it around.',
        title: 'Main Video',
        placement: 'bottom',
    },
    {
        target: '[data-tour="toggle-video-btn"]',
        content: 'Click this button to turn your camera on or off during a call. The camera icon shows your current status.',
        title: 'Camera Toggle',
        placement: 'top',
        data: { action: 'toggle-video' },
    },
    {
        target: '[data-tour="toggle-mute-btn"]',
        content: 'Use this button to mute or unmute your microphone. When muted, others won\'t hear you.',
        title: 'Microphone',
        placement: 'top',
        data: { action: 'toggle-mute' },
    },
    {
        target: '[data-tour="screen-share-btn"]',
        content: 'Share your screen to present documents, slides, or demonstrate your product to others.',
        title: 'Screen Share',
        placement: 'top',
    },
    {
        target: '[data-tour="end-call-btn"]',
        content: 'Click the red button to end the call. You can also view call duration here.',
        title: 'End Call',
        placement: 'top',
    },
    {
        target: '[data-tour="participants-list"]',
        content: 'See who\'s in the call and their status. Green indicators show who\'s currently speaking.',
        title: 'Participants',
        placement: 'left',
    },
];

export const audioCallTourSteps: Step[] = [
    {
        target: '[data-tour="audio-call-container"]',
        content: 'Welcome to the Audio Call feature! Have crystal-clear voice conversations without video.',
        title: 'Audio Call',
        placement: 'center',
    },
    {
        target: '[data-tour="user-avatar-large"]',
        content: 'During audio calls, you\'ll see the other person\'s profile picture here.',
        title: 'Caller Avatar',
        placement: 'bottom',
    },
    {
        target: '[data-tour="call-timer"]',
        content: 'Track how long you\'ve been talking. This helps you manage your meeting time.',
        title: 'Call Duration',
        placement: 'bottom',
    },
    {
        target: '[data-tour="toggle-mute-btn"]',
        content: 'Mute yourself when you\'re not speaking to reduce background noise for everyone.',
        title: 'Mute Control',
        placement: 'top',
        data: { action: 'toggle-mute' },
    },
    {
        target: '[data-tour="end-call-btn"]',
        content: 'End the call when you\'re done. The call summary will be saved to your meeting history.',
        title: 'End Call',
        placement: 'top',
    },
];

export const dashboardTourSteps: Step[] = [
    {
        target: '[data-tour="dashboard-container"]',
        content: 'Welcome to your Dashboard! This is your central hub for managing your business connections, meetings, and activities.',
        title: 'Dashboard Overview',
        placement: 'center',
    },
    {
        target: '[data-tour="dashboard-stats"]',
        content: 'These cards show key metrics at a glance - total connections, meetings scheduled, and your activity overview.',
        title: 'Quick Stats',
        placement: 'bottom',
    },
    {
        target: '[data-tour="dashboard-search"]',
        content: 'Use the search bar to quickly find investors, entrepreneurs, or specific opportunities.',
        title: 'Search',
        placement: 'bottom',
    },
    {
        target: '[data-tour="dashboard-filters"]',
        content: 'Filter by industry to narrow down your search results and find the perfect match.',
        title: 'Industry Filters',
        placement: 'bottom',
    },
    {
        target: '[data-tour="dashboard-meetings"]',
        content: 'View your upcoming meetings here. Click to see details or join calls directly.',
        title: 'Meetings Widget',
        placement: 'left',
    },
    {
        target: '[data-tour="dashboard-wallet"]',
        content: 'Your wallet balance and quick access to payments. Monitor your deals and transactions.',
        title: 'Wallet Widget',
        placement: 'left',
    },
    {
        target: '[data-tour="dashboard-video-call"]',
        content: 'Start video calls instantly from your dashboard. Connect face-to-face with your network.',
        title: 'Video Call',
        placement: 'left',
    },
    {
        target: '[data-tour="dashboard-audio-call"]',
        content: 'Need a quick voice conversation? Start an audio call with just one click.',
        title: 'Audio Call',
        placement: 'left',
    },
    {
        target: '[data-tour="dashboard-documents"]',
        content: 'Access your Document Chamber to upload, sign, and manage important business documents.',
        title: 'Document Chamber',
        placement: 'left',
    },
];

export const documentsTourSteps: Step[] = [
    {
        target: '[data-tour="documents-container"]',
        content: 'Welcome to the Document Chamber! Securely store, share, and sign important business documents.',
        title: 'Document Chamber',
        placement: 'center',
    },
    {
        target: '[data-tour="documents-upload"]',
        content: 'Upload new documents by dragging and dropping files here or clicking the upload button.',
        title: 'Upload Documents',
        placement: 'bottom',
    },
    {
        target: '[data-tour="documents-list"]',
        content: 'All your uploaded documents appear here. Click to preview, download, or share.',
        title: 'Document List',
        placement: 'right',
    },
    {
        target: '[data-tour="documents-preview"]',
        content: 'Preview documents before signing. View PDFs, DOCX files, and images directly in the browser.',
        title: 'Document Preview',
        placement: 'left',
    },
    {
        target: '[data-tour="documents-signature"]',
        content: 'Use the signature pad to electronically sign documents. Draw your signature or type your name.',
        title: 'Digital Signature',
        placement: 'top',
    },
    {
        target: '[data-tour="documents-share"]',
        content: 'Share documents with other users securely. Control who can view or edit each document.',
        title: 'Share Documents',
        placement: 'bottom',
    },
];

export const paymentsTourSteps: Step[] = [
    {
        target: '[data-tour="payments-container"]',
        content: 'Welcome to Payments! Manage your wallet, track transactions, and handle business deals securely.',
        title: 'Payments',
        placement: 'center',
    },
    {
        target: '[data-tour="payments-balance"]',
        content: 'Your current wallet balance. This shows available funds for deals and transactions.',
        title: 'Wallet Balance',
        placement: 'bottom',
    },
    {
        target: '[data-tour="payments-deals"]',
        content: 'View all your active and completed deals here. Track deal status and payment milestones.',
        title: 'Active Deals',
        placement: 'right',
    },
    {
        target: '[data-tour="payments-transactions"]',
        content: 'Complete transaction history with filters. Review past payments and transfers.',
        title: 'Transaction History',
        placement: 'top',
    },
    {
        target: '[data-tour="payments-deposit"]',
        content: 'Add funds to your wallet securely. Multiple payment methods are supported.',
        title: 'Deposit Funds',
        placement: 'bottom',
    },
    {
        target: '[data-tour="payments-withdraw"]',
        content: 'Withdraw funds from your wallet to your connected bank account.',
        title: 'Withdraw Funds',
        placement: 'bottom',
    },
];
