import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit, Trash2, Eye, Download, CalendarDays, ReceiptText, MessageCircleMore } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu';
import { getProposalPDFBlob } from '../../services/proposalService';
import Spinner from '../ui/Spinner';

const ProposalList = ({ proposals, loading, onEdit, onDelete, onPreview, onDownload, onSendWhatsApp }) => {
    const navigate = useNavigate();
    const [loadingPdf, setLoadingPdf] = useState(null); // State to track which PDF is being generated

    if (loading) {
        return <div className="flex h-40 items-center justify-center"><Spinner /></div>;
    }

    // --- 💡 THIS IS THE CORRECTED FUNCTION ---
    const handleDownloadPDF = async (proposalId, proposalTitle) => {
        setLoadingPdf(proposalId); // Show loading spinner for this specific proposal
        try {
            if (onDownload) {
                await onDownload(proposalId);
                return;
            }

            const blob = await getProposalPDFBlob(proposalId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${proposalTitle.replace(/\s+/g, '_')}_proposal.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download PDF:', error);
            // Here you could add a user-facing error message (e.g., using a toast notification)
            alert('Sorry, there was an error generating your PDF. Please try again.');
        } finally {
            setLoadingPdf(null); // Hide loading spinner
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Draft': return 'bg-gray-200 text-gray-800';
            case 'Ready': return 'bg-amber-100 text-amber-800';
            case 'Sent': return 'bg-blue-200 text-blue-800';
            case 'Accepted': return 'bg-green-200 text-green-800';
            case 'Declined': return 'bg-red-200 text-red-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    if (proposals.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <p className="text-lg font-medium text-slate-900">No proposals yet</p>
                <p className="mt-2 text-sm text-slate-500">Create your first proposal to start sending pricing and scope to clients.</p>
            </div>
        );
    }

    return (
        <>
        <div className="space-y-3 md:hidden">
            {proposals.map((proposal) => (
                <div key={proposal.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{proposal.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{proposal.clientName}</p>
                        </div>
                        <Badge className={getStatusBadge(proposal.status)}>{proposal.status}</Badge>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <p className="inline-flex items-center gap-2"><ReceiptText className="h-3.5 w-3.5" />Rs. {Number(proposal.total || 0).toFixed(2)}</p>
                        <p className="inline-flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" />{proposal.createdAt?.seconds ? new Date(proposal.createdAt.seconds * 1000).toLocaleDateString() : ''}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => navigate(`/proposals/${proposal.id}`)} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">Details</button>
                        <button onClick={() => onPreview?.(proposal.id)} className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700">Preview</button>
                        <button onClick={() => handleDownloadPDF(proposal.id, proposal.title)} className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">Download</button>
                        <button onClick={() => onEdit(proposal)} className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">Edit</button>
                        <button onClick={() => onSendWhatsApp?.(proposal)} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">WhatsApp</button>
                    </div>
                </div>
            ))}
        </div>
        <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white md:block">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Proposal</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Client</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Value</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Created</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                    {proposals.map((proposal) => (
                        <tr key={proposal.id} className="hover:bg-slate-50/70">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{proposal.title}</p>
                                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                        <ReceiptText className="h-3.5 w-3.5" />
                                        Scope ready for PDF and approval
                                    </p>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proposal.clientName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">Rs. {Number(proposal.total || 0).toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Badge className={getStatusBadge(proposal.status)}>{proposal.status}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className="inline-flex items-center gap-2">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    {proposal.createdAt?.seconds ? new Date(proposal.createdAt.seconds * 1000).toLocaleDateString() : ''}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {loadingPdf === proposal.id ? (
                                    <Spinner />
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={20} /></button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => navigate(`/proposals/${proposal.id}`)}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => onPreview?.(proposal.id)}><Eye className="mr-2 h-4 w-4" /> Preview PDF</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleDownloadPDF(proposal.id, proposal.title)}><Download className="mr-2 h-4 w-4" /> Download PDF</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => onSendWhatsApp?.(proposal)}><MessageCircleMore className="mr-2 h-4 w-4" /> Send via WhatsApp</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => onEdit(proposal)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => onDelete(proposal.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    );
};

export default ProposalList;
