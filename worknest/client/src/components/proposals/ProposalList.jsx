import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit, Trash2, Eye, Download } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu';
import { generateProposalPDF } from '../../services/proposalService'; // Ensure this is imported
import Spinner from '../ui/Spinner'; // Assuming you have a spinner component

const ProposalList = ({ proposals, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const [loadingPdf, setLoadingPdf] = useState(null); // State to track which PDF is being generated

    // --- 💡 THIS IS THE CORRECTED FUNCTION ---
    const handleDownloadPDF = async (proposalId, proposalTitle) => {
        setLoadingPdf(proposalId); // Show loading spinner for this specific proposal
        try {
            const pdfUrl = await generateProposalPDF(proposalId);
            if (pdfUrl) {
                // 1. Create a temporary anchor (link) element
                const link = document.createElement('a');
                link.href = pdfUrl;

                // 2. Set the 'download' attribute. This is the key part that forces a download.
                // We'll name the file based on the proposal title.
                link.setAttribute('download', `${proposalTitle.replace(/\s+/g, '_')}_proposal.pdf`);

                // 3. Append to the document, click it, and then remove it.
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
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
            case 'Sent': return 'bg-blue-200 text-blue-800';
            case 'Accepted': return 'bg-green-200 text-green-800';
            case 'Declined': return 'bg-red-200 text-red-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    if (proposals.length === 0) {
        return <p className="text-center text-gray-500 py-8">No proposals found. Click "Create Proposal" to get started.</p>;
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {proposals.map((proposal) => (
                        <tr key={proposal.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proposal.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proposal.clientName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{proposal.total.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Badge className={getStatusBadge(proposal.status)}>{proposal.status}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(proposal.createdAt.seconds * 1000).toLocaleDateString()}
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
                                            <DropdownMenuItem onSelect={() => navigate(`/proposals/${proposal.id}/view`)}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                                            {/* This button now calls the corrected download function */}
                                            <DropdownMenuItem onSelect={() => handleDownloadPDF(proposal.id, proposal.title)}><Download className="mr-2 h-4 w-4" /> Download PDF</DropdownMenuItem>
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
    );
};

export default ProposalList;
