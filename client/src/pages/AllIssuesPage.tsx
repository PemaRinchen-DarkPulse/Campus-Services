import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import './ReportsPage.css';

export default function AllIssuesPage({ user }) {
  const [issues, setIssues] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: '', categories: [], urgency: '', datePeriod: 'today', exactDate: '', dateFrom: '', dateTo: '' });
  const [locationTab, setLocationTab] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Assignment offcanvas state
  const [isAssignOffcanvasOpen, setIsAssignOffcanvasOpen] = useState(false);
  const [selectedIssueToAssign, setSelectedIssueToAssign] = useState(null);
  const [maintenanceUsers, setMaintenanceUsers] = useState([]);

  // View Report offcanvas state
  const [isViewReportOpen, setIsViewReportOpen] = useState(false);
  const [selectedReportIssue, setSelectedReportIssue] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const downloadReportAsPdf = async () => {
    if (!selectedReportIssue) return;
    setIsDownloadingPdf(true);
    try {
      const issue = selectedReportIssue;
      const cd = issue.completionDetails;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const PW = pdf.internal.pageSize.getWidth();
      const PH = pdf.internal.pageSize.getHeight();
      const ML = 20;
      const MR = 20;
      const CW = PW - ML - MR;
      let y = 0;
      const issueId = (issue._id || issue.id || '').toString().slice(-8).toUpperCase();
      const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      let pageNum = 1;

      // ── Helpers ──
      const addFooter = () => {
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.3);
        pdf.line(ML, PH - 14, PW - MR, PH - 14);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(80, 80, 80);
        pdf.text('Manage My Campus  |  Maintenance Issue Report  |  Confidential', ML, PH - 9);
        pdf.text(`Page ${pageNum}`, PW - MR, PH - 9, { align: 'right' });
      };

      const newPage = () => {
        addFooter();
        pdf.addPage();
        pageNum++;
        y = 20;
      };

      const checkBreak = (need) => {
        if (y + need > PH - 20) newPage();
      };

      // Section heading: bold, underlined with a thin rule
      const drawSectionTitle = (title) => {
        checkBreak(14);
        y += 4;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        pdf.text(title, ML, y);
        y += 2;
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.4);
        pdf.line(ML, y, ML + CW, y);
        y += 6;
      };

      // Full-width label + value row (no background)
      const fieldRow = (label, value) => {
        if (!value && value !== 0) return;
        const valStr = String(value);
        const labelW = 52;
        const valLines = pdf.splitTextToSize(valStr, CW - labelW - 2);
        const rowH = Math.max(6, valLines.length * 5.5);
        checkBreak(rowH + 2);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);
        pdf.text(label + ':', ML, y + 4.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.text(valLines, ML + labelW, y + 4.5);
        y += rowH + 3;
      };

      // Two-column row (two fields side by side)
      const twoFieldRow = (l1, v1, l2, v2) => {
        const half = CW / 2;
        const lw = 30;
        const lines1 = v1 ? pdf.splitTextToSize(String(v1), half - lw - 4) : [];
        const lines2 = v2 ? pdf.splitTextToSize(String(v2), half - lw - 4) : [];
        const rowH = Math.max(6, Math.max(lines1.length, lines2.length) * 5.5);
        checkBreak(rowH + 2);
        if (v1) {
          pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(60, 60, 60);
          pdf.text(l1 + ':', ML, y + 4.5);
          pdf.setFont('helvetica', 'normal'); pdf.setTextColor(0, 0, 0);
          pdf.text(lines1, ML + lw, y + 4.5);
        }
        if (v2) {
          pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(60, 60, 60);
          pdf.text(l2 + ':', ML + half, y + 4.5);
          pdf.setFont('helvetica', 'normal'); pdf.setTextColor(0, 0, 0);
          pdf.text(lines2, ML + half + lw, y + 4.5);
        }
        y += rowH + 3;
      };

      // Multi-line text block with indented body
      const textBlock = (label, value) => {
        if (!value) return;
        const lines = pdf.splitTextToSize(String(value), CW);
        const blockH = 6 + lines.length * 5.5;
        checkBreak(blockH + 4);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);
        pdf.text(label + ':', ML, y + 4.5);
        y += 7;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.text(lines, ML + 4, y);
        y += lines.length * 5.5 + 3;
      };

      // ── LETTERHEAD ──
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(1);
      pdf.line(ML, 14, PW - MR, 14);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('MANAGE MY CAMPUS', ML, 10);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(80, 80, 80);
      pdf.text('Campus Facilities Management System', PW - MR, 10, { align: 'right' });

      pdf.setLineWidth(0.3);
      pdf.line(ML, 15.5, PW - MR, 15.5);

      // Report title block
      y = 24;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('MAINTENANCE ISSUE REPORT', ML, y);
      y += 8;

      // Meta line: Report ID | Generated | Status
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Report ID: #${issueId}     |     Date Generated: ${generatedDate}     |     Status: ${issue.status}`, ML, y);
      y += 4;
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.line(ML, y, PW - MR, y);
      y += 10;

      // ── SECTION 1: ISSUE DETAILS ──
      drawSectionTitle('1.  Issue Information');

      twoFieldRow('Category', issue.category, 'Urgency', issue.urgency || 'Low');
      twoFieldRow('Location', issue.location, 'Status', issue.status);
      twoFieldRow('Reported By', issue.reportedBy?.name || 'N/A', 'Assigned To', issue.assignedTo?.name || 'Unassigned');
      twoFieldRow(
        'Reported Date',
        issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
        'Assigned Date',
        issue.assignedAt ? new Date(issue.assignedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'
      );

      if (issue.classroomName) fieldRow('Classroom', `${issue.classroomName}${issue.teacher ? `  (Teacher: ${issue.teacher})` : ''}`);
      if (issue.dormName)      fieldRow('Dormitory', `${issue.dormName}${issue.roomNumber ? `,  Room ${issue.roomNumber}` : ''}`);
      if (issue.village)       fieldRow('Village / Faculty', `${issue.village}${issue.facultyName ? `  (${issue.facultyName})` : ''}`);
      if (issue.oldCampusArea) fieldRow('Old Campus Area', issue.oldCampusArea);

      textBlock('Description', issue.description);

      // ── SECTION 2: COMPLETION DETAILS ──
      if (cd) {
        drawSectionTitle('2.  Completion Details');

        if (cd.actionTaken)    textBlock('Action Taken', cd.actionTaken);
        if (cd.rootCause)      textBlock('Root Cause', cd.rootCause);
        if (cd.materialsUsed)  textBlock('Materials & Resources Used', cd.materialsUsed);
        if (cd.costDetail)     fieldRow('Cost Detail', cd.costDetail);
        if (cd.notesAndRemarks) textBlock('Notes & Remarks', cd.notesAndRemarks);

        // Proof of Work image
        if (cd.proofOfWork?.data?.data && cd.proofOfWork.contentType?.startsWith('image/')) {
          const base64 = btoa(new Uint8Array(cd.proofOfWork.data.data).reduce((d, b) => d + String.fromCharCode(b), ''));
          const imgSrc = `data:${cd.proofOfWork.contentType};base64,${base64}`;
          const imgFormat = cd.proofOfWork.contentType.split('/')[1].toUpperCase() === 'JPG' ? 'JPEG' : cd.proofOfWork.contentType.split('/')[1].toUpperCase();

          // Load image to get natural dimensions for correct aspect ratio
          const naturalSize = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
            img.onerror = () => resolve({ w: 1, h: 1 });
            img.src = imgSrc;
          });

          const maxW = CW;          // max width in mm
          const maxH = 110;         // max height in mm
          const aspectRatio = naturalSize.w / naturalSize.h;

          let imgW = maxW;
          let imgH = imgW / aspectRatio;
          if (imgH > maxH) {
            imgH = maxH;
            imgW = imgH * aspectRatio;
          }

          // Centre horizontally if narrower than content width
          const imgX = ML + (CW - imgW) / 2;
          const padding = 3;
          const boxH = imgH + padding * 2;

          checkBreak(boxH + 14);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(60, 60, 60);
          pdf.text('Proof of Work:', ML, y + 4.5);
          y += 9;
          pdf.setDrawColor(180, 180, 180);
          pdf.setLineWidth(0.3);
          pdf.rect(ML, y, CW, boxH);
          pdf.addImage(imgSrc, imgFormat, imgX, y + padding, imgW, imgH, undefined, 'FAST');
          y += boxH + 6;
        }
      }

      // ── SIGNATURE BLOCK ──
      checkBreak(40);
      y += 8;
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.line(ML, y, PW - MR, y);
      y += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(80, 80, 80);
      pdf.text('This report was automatically generated by the Manage My Campus system. For queries, contact the Facilities Management Office.', ML, y, { maxWidth: CW });
      y += 14;
      const sigLineW = 60;
      pdf.line(ML, y, ML + sigLineW, y);
      pdf.line(PW - MR - sigLineW, y, PW - MR, y);
      y += 5;
      pdf.setFontSize(8);
      pdf.text('Prepared By', ML, y);
      pdf.text('Authorized Signature', PW - MR - sigLineW, y);

      // ── FOOTER on last page ──
      addFooter();

      pdf.save(`issue-report-${issueId}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const role = user?.role?.toLowerCase();
  const isAdmin = role === 'admin';
  const isMaintenanceWorker = role === 'maintenance' || role === 'maintiance';

  useEffect(() => {
    fetchAllIssues();
    if (isAdmin) {
      fetchMaintenanceUsers();
    }
  }, [isAdmin]);

  const fetchMaintenanceUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMaintenanceUsers(data.data.filter(u => u.role?.toLowerCase() === 'maintenance' || u.role?.toLowerCase() === 'maintiance'));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchAllIssues = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/reports/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setIssues(result.data);
      }
    } catch (error) {
      console.error('Error fetching all issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptTask = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/reports/${id}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        fetchAllIssues();
      } else {
        alert(result.message || 'Failed to accept task');
      }
    } catch (error) {
      console.error('Error accepting task:', error);
      alert('An error occurred while accepting the task');
    }
  };

  const handleDeclineTask = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/reports/${id}/decline`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        fetchAllIssues();
      } else {
        alert(result.message || 'Failed to decline task');
      }
    } catch (error) {
      console.error('Error declining task:', error);
      alert('An error occurred while declining the task');
    }
  };

  const handleAssignUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const issueId = selectedIssueToAssign?._id || selectedIssueToAssign?.id;
      const response = await fetch(`${API_BASE_URL}/api/reports/${issueId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      const result = await response.json();
      if (result.success) {
        setIsAssignOffcanvasOpen(false);
        setSelectedIssueToAssign(null);
        fetchAllIssues();
      } else {
        alert(result.message || 'Failed to assign task');
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('An error occurred while assigning the task');
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const locationTabMap = {
    'All': null,
    'Classroom': 'Classroom',
    'Dormitories': 'Dorm',
    'Faculty Housing': 'Faculty Housing',
    'Old Campus': 'Old Campus',
  };

  const matchesFilters = (issue) => {
    if (filters.status && issue.status !== filters.status) return false;
    if (filters.categories.length > 0 && !filters.categories.includes(issue.category)) return false;
    if (filters.urgency && (issue.urgency || 'Low') !== filters.urgency) return false;
    if (filters.datePeriod) {
      const now = new Date();
      const issueDate = issue.createdAt ? new Date(issue.createdAt) : null;
      if (!issueDate) return false;
      const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const today = startOf(now);
      if (filters.datePeriod === 'today' && startOf(issueDate).getTime() !== today.getTime()) return false;
      if (filters.datePeriod === 'week') {
        const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
        if (issueDate < weekAgo) return false;
      }
      if (filters.datePeriod === 'month') {
        const monthAgo = new Date(today); monthAgo.setMonth(today.getMonth() - 1);
        if (issueDate < monthAgo) return false;
      }
      if (filters.datePeriod === '3months') {
        const threeMonthsAgo = new Date(today); threeMonthsAgo.setMonth(today.getMonth() - 3);
        if (issueDate < threeMonthsAgo) return false;
      }
    } else if (filters.exactDate) {
      const issueDate = issue.createdAt ? new Date(issue.createdAt).toISOString().slice(0, 10) : '';
      if (issueDate !== filters.exactDate) return false;
    } else {
      const issueDate = issue.createdAt ? new Date(issue.createdAt) : null;
      if (filters.dateFrom && issueDate && issueDate < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && issueDate && issueDate > new Date(filters.dateTo + 'T23:59:59')) return false;
    }
    return true;
  };

  const filteredIssues = issues.filter(issue => {
    if (locationTab !== 'All' && issue.location !== locationTabMap[locationTab]) return false;
    return matchesFilters(issue);
  });

  const activeFilterCount = [
    filters.status,
    filters.categories.length > 0,
    filters.urgency,
    filters.datePeriod || filters.exactDate || filters.dateFrom || filters.dateTo
  ].filter(Boolean).length;

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'In Progress':
        return 'status-progress';
      case 'Resolved':
        return 'status-resolved';
      default:
        return '';
    }
  };

  const getCategoryClass = (category) => {
    switch (category) {
      case 'Electrical':
        return 'td-badge badge-electrical';
      case 'Plumbing':
        return 'td-badge badge-plumbing';
      case 'Furniture':
        return 'td-badge badge-furniture';
      default:
        return 'td-badge badge-other';
    }
  };

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/50';
    if (typeof image === 'string') return image;
    if (image.data && image.data.data) {
      const base64String = btoa(
        new Uint8Array(image.data.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      return `data:${image.contentType};base64,${base64String}`;
    }
    return 'https://via.placeholder.com/50';
  };

  const getSpecificArea = (issue) => {
    switch (issue.location) {
      case 'Classroom':
        if (issue.classroomName && issue.teacher) {
          return (
            <>
              <div>{issue.classroomName}</div>
              <div style={{ fontSize: '0.9em', color: '#64748b', marginTop: '2px' }}>Belongs to: {issue.teacher}</div>
            </>
          );
        }
        return issue.classroomName || issue.classroom || 'N/A';
      case 'Dorm':
        if (issue.dormName && issue.roomNumber) {
          return (
            <>
              <div>{issue.dormName}</div>
              <div style={{ fontSize: '0.9em', color: '#64748b', marginTop: '2px' }}>Room: {issue.roomNumber}</div>
            </>
          );
        }
        return issue.dormName || issue.classroom || 'N/A';
      case 'Faculty Housing':
        if (issue.village && issue.facultyName) {
          return (
            <>
              <div>{issue.village}</div>
              <div style={{ fontSize: '0.9em', color: '#64748b', marginTop: '2px' }}>Faculty: {issue.facultyName}</div>
            </>
          );
        }
        return issue.village || issue.classroom || 'N/A';
      case 'Old Campus':
        return issue.oldCampusArea || issue.classroom || 'N/A';
      default:
        return issue.classroom || 'N/A';
    }
  };

  return (
    <div className="reports-page-container">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">All Issues</h1>
          <p className="reports-subtitle">Overview of all reported issues across campus</p>
        </div>
        <div>
          <button
            onClick={() => setIsFilterOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
              border: activeFilterCount > 0 ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0',
              background: activeFilterCount > 0 ? '#eef2ff' : 'white',
              color: activeFilterCount > 0 ? '#6366f1' : '#334155',
              fontWeight: '500', fontSize: '14px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filter
            {activeFilterCount > 0 && (
              <span style={{
                background: '#6366f1', color: 'white', borderRadius: '50%',
                width: '18px', height: '18px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '11px', fontWeight: '700'
              }}>{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {(() => {
        const tabConfig = [
          {
            label: 'All',
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            ),
            color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe'
          },
          {
            label: 'Classroom',
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            ),
            color: '#0ea5e9', bg: '#e0f2fe', border: '#bae6fd'
          },
          {
            label: 'Dormitories',
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            ),
            color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe'
          },
          {
            label: 'Faculty Housing',
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10M2 10.6L12 2l10 8.6"/>
              </svg>
            ),
            color: '#f59e0b', bg: '#fffbeb', border: '#fde68a'
          },
          {
            label: 'Old Campus',
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            ),
            color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0'
          },
        ];
        return (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {tabConfig.map(({ label, icon, color, bg }) => {
              const count = label === 'All'
                ? issues.filter(matchesFilters).length
                : issues.filter(i => i.location === locationTabMap[label] && matchesFilters(i)).length;
              const isActive = locationTab === label;
              return (
                <button
                  key={label}
                  onClick={() => setLocationTab(label)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                    border: `1px solid ${isActive ? color + '55' : color + '22'}`,
                    background: isActive ? bg : 'white',
                    color: color,
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '13px', whiteSpace: 'nowrap',
                    boxShadow: isActive ? `0 2px 8px ${color}22` : 'none',
                    transition: 'all 0.18s ease'
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = color + '55'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = color + '22'; } }}
                >
                  <span style={{ display: 'flex' }}>{icon}</span>
                  {label} &nbsp;<strong>({count})</strong>
                </button>
              );
            })}
          </div>
        );
      })()}

      <div className="reports-card">
        <div className="table-responsive" style={{ overflow: 'visible' }}>
          <table className="reports-table" style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '8%', textAlign: 'left', paddingLeft: '16px' }}>Image</th>
                <th style={{ width: '10%', textAlign: 'left' }}>Location</th>
                <th style={{ width: '12%', textAlign: 'left' }}>Specific Area</th>
                <th style={{ width: '10%', textAlign: 'left' }}>Category</th>
                <th style={{ width: '20%', textAlign: 'left' }}>Description</th>
                <th style={{ width: '10%', textAlign: 'left' }}>Reported By</th>
                <th style={{ width: '8%', textAlign: 'left' }}>Urgency</th>
                <th style={{ width: '8%', textAlign: 'left' }}>Status</th>
                <th style={{ width: '8%', textAlign: 'left' }}>Date</th>
                <th style={{ width: '6%', textAlign: 'right', paddingRight: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td style={{ textAlign: 'left', paddingLeft: '16px' }}>
                      <div className="skeleton-box" style={{ width: '40px', height: '40px', borderRadius: '4px' }}></div>
                    </td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '80%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'left' }}>
                      <div className="skeleton-box" style={{ width: '90%', height: '20px', borderRadius: '4px', marginBottom: '4px' }}></div>
                      <div className="skeleton-box" style={{ width: '60%', height: '14px', borderRadius: '4px' }}></div>
                    </td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '60%', height: '24px', borderRadius: '12px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '100%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '70%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '50%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '60%', height: '24px', borderRadius: '12px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '80%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                      <div className="skeleton-box" style={{ width: '20px', height: '20px', borderRadius: '50%', margin: '0 0 0 auto' }}></div>
                    </td>
                  </tr>
                ))
              ) : filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan="10" className="empty-state" style={{ textAlign: 'center' }}>No issues found.</td>
                </tr>
              ) : (
                filteredIssues.map((issue, index) => (
                  <tr key={issue._id || issue.id}>
                    <td style={{ textAlign: 'left', paddingLeft: '16px' }}>
                      <img src={getImageUrl(issue.image)} alt="Issue Thumbnail" className="report-thumb" />
                    </td>
                  <td className="fw-medium" style={{ textAlign: 'left' }}>{issue.location}</td>
                  <td style={{ textAlign: 'left' }}>{getSpecificArea(issue)}</td>
                  <td style={{ textAlign: 'left' }}>
                    <span className={getCategoryClass(issue.category)}>{issue.category}</span>
                  </td>
                  <td className="description-cell" style={{ textAlign: 'left' }}>{issue.description}</td>
                  <td style={{ textAlign: 'left' }}>{issue.reportedBy?.name || 'Unknown'}</td>
                  <td style={{ textAlign: 'left' }}>
                    <span style={{ 
                      fontWeight: '500', 
                      color: issue.urgency === 'High' ? '#ef4444' : issue.urgency === 'Medium' ? '#f97316' : '#64748b' 
                    }}>
                      {issue.urgency || 'Low'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    <span className={`status-badge ${getStatusClass(issue.status)}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '13px', textAlign: 'left' }}>
                    {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '16px', position: 'relative' }}>
                    <div style={{ position: 'relative', display: 'inline-block', textAlign: 'left' }}>
                      <button 
                        onClick={() => toggleDropdown(issue._id || issue.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#666' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="5" cy="12" r="1.5"></circle>
                          <circle cx="12" cy="12" r="1.5"></circle>
                          <circle cx="19" cy="12" r="1.5"></circle>
                        </svg>
                      </button>
                      {openDropdownId === (issue._id || issue.id) && (
                        <div style={{
                          position: 'absolute',
                          right: '0',
                          top: (filteredIssues.length <= 2 || index >= filteredIssues.length - 2) ? 'auto' : 'calc(100% + 4px)',
                          bottom: (filteredIssues.length <= 2 || index >= filteredIssues.length - 2) ? 'calc(100% + 4px)' : 'auto',
                          background: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          zIndex: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: '130px',
                          overflow: 'hidden'
                        }}>
                          {isAdmin && issue.status === 'Resolved' && (
                            <button 
                              onClick={() => {
                                toggleDropdown(issue._id || issue.id);
                                setSelectedReportIssue(issue);
                                setIsViewReportOpen(true);
                              }}
                              style={{ padding: '8px 16px', border: 'none', borderBottom: '1px solid #f1f5f9', background: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#8b5cf6', fontSize: '14px', whiteSpace: 'nowrap' }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                              View Reports
                            </button>
                          )}
                          {!isMaintenanceWorker && issue.status !== 'Resolved' && (
                            <>
                              {issue.assignedTo ? (
                                <button 
                                  onClick={() => toggleDropdown(issue._id || issue.id)}
                                  style={{ padding: '8px 16px', border: 'none', borderBottom: '1px solid #f1f5f9', background: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#334155', fontSize: '14px', whiteSpace: 'nowrap' }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                  Update
                                </button>
                              ) : (
                                <button 
                                  onClick={() => {
                                    toggleDropdown(issue._id || issue.id);
                                    setSelectedIssueToAssign(issue);
                                    setIsAssignOffcanvasOpen(true);
                                  }}
                                  style={{ padding: '8px 16px', border: 'none', borderBottom: '1px solid #f1f5f9', background: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#334155', fontSize: '14px', whiteSpace: 'nowrap' }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                                  Assign Task
                                </button>
                              )}
                            </>
                          )}
                          {isMaintenanceWorker && issue.status !== 'Resolved' && (
                            <>
                              <button 
                                onClick={() => {
                                  toggleDropdown(issue._id || issue.id);
                                  handleAcceptTask(issue._id || issue.id);
                                }}
                                style={{ padding: '8px 16px', border: 'none', borderBottom: '1px solid #f1f5f9', background: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#16a34a', fontSize: '14px', whiteSpace: 'nowrap' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Accept task
                              </button>
                              <button 
                                onClick={() => {
                                  toggleDropdown(issue._id || issue.id);
                                  handleDeclineTask(issue._id || issue.id);
                                }}
                                style={{ padding: '8px 16px', border: 'none', background: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#dc2626', fontSize: '14px', whiteSpace: 'nowrap' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                Decline task
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Offcanvas */}
      {isFilterOpen && (
        <div className="offcanvas-overlay" onClick={() => setIsFilterOpen(false)}>
          <div className="offcanvas-content" onClick={(e) => e.stopPropagation()}>
            <div className="offcanvas-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                Filters
              </h2>
              <div className="offcanvas-header-actions">
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => setFilters({ status: '', categories: [], urgency: '', datePeriod: '', exactDate: '', dateFrom: '', dateTo: '' })}
                    style={{ background: '#fef2f2', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: '5px 12px', borderRadius: '6px', marginRight: '8px' }}
                  >Clear all</button>
                )}
                <button className="btn-close" onClick={() => setIsFilterOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>

            <div className="offcanvas-body" style={{ padding: '20px', overflowY: 'auto' }}>

              {/* Category */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[{label:'Electrical',color:'#f59e0b',bg:'#fffbeb',border:'#fde68a'},
                    {label:'Plumbing',color:'#0ea5e9',bg:'#e0f2fe',border:'#bae6fd'},
                    {label:'Furniture',color:'#8b5cf6',bg:'#f5f3ff',border:'#ddd6fe'},
                    {label:'Other',color:'#64748b',bg:'#f8fafc',border:'#e2e8f0'}
                  ].map(({label, color, bg, border}) => {
                    const active = filters.categories.includes(label);
                    return (
                      <button key={label} onClick={() => setFilters(f => ({
                        ...f,
                        categories: active ? f.categories.filter(c => c !== label) : [...f.categories, label]
                      }))}
                        style={{ padding: '7px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: `1.5px solid ${active ? border : '#e2e8f0'}`, background: active ? bg : 'white', color: active ? color : '#94a3b8', cursor: 'pointer', transition: 'all 0.15s' }}
                      >{label}</button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Status</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[{label:'Pending',color:'#f59e0b',bg:'#fffbeb',border:'#fde68a'},
                    {label:'In Progress',color:'#0ea5e9',bg:'#e0f2fe',border:'#bae6fd'},
                    {label:'Resolved',color:'#10b981',bg:'#ecfdf5',border:'#a7f3d0'}
                  ].map(({label,color,bg,border}) => {
                    const active = filters.status === label;
                    return (
                      <button key={label} onClick={() => setFilters(f => ({ ...f, status: active ? '' : label }))}
                        style={{ flex: 1, padding: '8px 6px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: `1.5px solid ${active ? border : '#e2e8f0'}`, background: active ? bg : 'white', color: active ? color : '#94a3b8', cursor: 'pointer', transition: 'all 0.15s' }}
                      >{label}</button>
                    );
                  })}
                </div>
              </div>

              {/* Urgency */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Urgency</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[{label:'Low',color:'#64748b',bg:'#f8fafc',border:'#e2e8f0'},
                    {label:'Medium',color:'#f97316',bg:'#fff7ed',border:'#fed7aa'},
                    {label:'High',color:'#ef4444',bg:'#fef2f2',border:'#fecaca'}
                  ].map(({label,color,bg,border}) => {
                    const active = filters.urgency === label;
                    return (
                      <button key={label} onClick={() => setFilters(f => ({ ...f, urgency: active ? '' : label }))}
                        style={{ flex: 1, padding: '8px 6px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: `1.5px solid ${active ? border : '#e2e8f0'}`, background: active ? bg : 'white', color: active ? color : '#94a3b8', cursor: 'pointer', transition: 'all 0.15s' }}
                      >{label}</button>
                    );
                  })}
                </div>
              </div>

              {/* Date */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Date</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { label: 'Today', value: 'today' },
                    { label: 'Last 7 days', value: 'week' },
                    { label: 'Last 30 days', value: 'month' },
                    { label: 'Last 3 months', value: '3months' },
                  ].map(({ label, value }) => {
                    const active = filters.datePeriod === value;
                    return (
                      <button key={value}
                        onClick={() => setFilters(f => ({ ...f, datePeriod: active ? '' : value, exactDate: '', dateFrom: '', dateTo: '' }))}
                        style={{ padding: '7px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: `1.5px solid ${active ? '#c7d2fe' : '#e2e8f0'}`, background: active ? '#eef2ff' : 'white', color: active ? '#6366f1' : '#94a3b8', cursor: 'pointer', transition: 'all 0.15s' }}
                      >{label}</button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#cbd5e1', letterSpacing: '0.05em' }}>OR PICK CUSTOM</span>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Exact date</span>
                  <input type="date" value={filters.exactDate}
                    onChange={e => setFilters(f => ({ ...f, exactDate: e.target.value, datePeriod: '', dateFrom: '', dateTo: '' }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1.5px solid ${filters.exactDate ? '#c7d2fe' : '#e2e8f0'}`, fontSize: '13px', color: filters.exactDate ? '#1e293b' : '#94a3b8', background: filters.exactDate ? '#fafbff' : 'white', boxSizing: 'border-box', cursor: 'pointer' }}
                  />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Date range</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="date" value={filters.dateFrom}
                      onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value, datePeriod: '', exactDate: '' }))}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: `1.5px solid ${filters.dateFrom ? '#c7d2fe' : '#e2e8f0'}`, fontSize: '13px', color: filters.dateFrom ? '#1e293b' : '#94a3b8', background: filters.dateFrom ? '#fafbff' : 'white', boxSizing: 'border-box', cursor: 'pointer' }}
                    />
                    <span style={{ color: '#cbd5e1', fontSize: '16px', fontWeight: '700' }}>→</span>
                    <input type="date" value={filters.dateTo}
                      onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value, datePeriod: '', exactDate: '' }))}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: `1.5px solid ${filters.dateTo ? '#c7d2fe' : '#e2e8f0'}`, fontSize: '13px', color: filters.dateTo ? '#1e293b' : '#94a3b8', background: filters.dateTo ? '#fafbff' : 'white', boxSizing: 'border-box', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* View Report Offcanvas */}
      {isViewReportOpen && selectedReportIssue && (
        <>
          <div className="offcanvas-overlay" onClick={() => setIsViewReportOpen(false)}></div>
          <div className="offcanvas-content" style={{ width: '480px', display: 'flex', flexDirection: 'column' }}>
            <div className="offcanvas-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                Issue Report
              </h2>
              <div className="offcanvas-header-actions">
                <button className="btn-close" onClick={() => setIsViewReportOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
            <div className="offcanvas-body" style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
              <div style={{ background: '#ffffff', padding: '4px' }}>

              {/* Issue Details Section */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ width: '3px', height: '18px', backgroundColor: '#6366f1', borderRadius: '2px' }}></div>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Issue Details</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Status</span>
                    <span className={`status-badge ${selectedReportIssue.status === 'Resolved' ? 'status-resolved' : selectedReportIssue.status === 'In Progress' ? 'status-progress' : 'status-pending'}`}>{selectedReportIssue.status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Category</span>
                    <span className={getCategoryClass(selectedReportIssue.category)}>{selectedReportIssue.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Urgency</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: selectedReportIssue.urgency === 'High' ? '#ef4444' : selectedReportIssue.urgency === 'Medium' ? '#f59e0b' : '#3b82f6' }}>{selectedReportIssue.urgency || 'Low'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Location</span>
                    <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500', textAlign: 'right' }}>{selectedReportIssue.location}</span>
                  </div>
                  {selectedReportIssue.classroomName && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Classroom</span>
                      <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{selectedReportIssue.classroomName}{selectedReportIssue.teacher ? ` (${selectedReportIssue.teacher})` : ''}</span>
                    </div>
                  )}
                  {selectedReportIssue.dormName && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Dorm / Room</span>
                      <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{selectedReportIssue.dormName}{selectedReportIssue.roomNumber ? ` — Room ${selectedReportIssue.roomNumber}` : ''}</span>
                    </div>
                  )}
                  {selectedReportIssue.village && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Village / Faculty</span>
                      <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{selectedReportIssue.village}{selectedReportIssue.facultyName ? ` (${selectedReportIssue.facultyName})` : ''}</span>
                    </div>
                  )}
                  {selectedReportIssue.oldCampusArea && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Area</span>
                      <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{selectedReportIssue.oldCampusArea}</span>
                    </div>
                  )}
                  <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Description</span>
                    <span style={{ fontSize: '13px', color: '#1e293b' }}>{selectedReportIssue.description}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Reported By</span>
                    <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{selectedReportIssue.reportedBy?.name || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Assigned To</span>
                    <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{selectedReportIssue.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Reported Date</span>
                    <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{selectedReportIssue.createdAt ? new Date(selectedReportIssue.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                  </div>
                  {selectedReportIssue.assignedAt && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Assigned Date</span>
                      <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{new Date(selectedReportIssue.assignedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Completion Details Section */}
              {selectedReportIssue.completionDetails && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <div style={{ width: '3px', height: '18px', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Completion Details</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedReportIssue.completionDetails.actionTaken && (
                      <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Action Taken</span>
                        <span style={{ fontSize: '13px', color: '#1e293b' }}>{selectedReportIssue.completionDetails.actionTaken}</span>
                      </div>
                    )}
                    {selectedReportIssue.completionDetails.rootCause && (
                      <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Root Cause</span>
                        <span style={{ fontSize: '13px', color: '#1e293b' }}>{selectedReportIssue.completionDetails.rootCause}</span>
                      </div>
                    )}
                    {selectedReportIssue.completionDetails.materialsUsed && (
                      <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Materials & Resources Used</span>
                        <span style={{ fontSize: '13px', color: '#1e293b' }}>{selectedReportIssue.completionDetails.materialsUsed}</span>
                      </div>
                    )}
                    {selectedReportIssue.completionDetails.costDetail && (
                      <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Cost Detail</span>
                        <span style={{ fontSize: '13px', color: '#1e293b' }}>{selectedReportIssue.completionDetails.costDetail}</span>
                      </div>
                    )}
                    {selectedReportIssue.completionDetails.notesAndRemarks && (
                      <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Notes & Remarks</span>
                        <span style={{ fontSize: '13px', color: '#1e293b' }}>{selectedReportIssue.completionDetails.notesAndRemarks}</span>
                      </div>
                    )}
                    {selectedReportIssue.completionDetails.proofOfWork?.data && (() => {
                      const proof = selectedReportIssue.completionDetails.proofOfWork;
                      const isImage = proof.contentType?.startsWith('image/');
                      const base64 = btoa(new Uint8Array(proof.data.data).reduce((d, b) => d + String.fromCharCode(b), ''));
                      const src = `data:${proof.contentType};base64,${base64}`;
                      return (
                        <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', display: 'block', marginBottom: '8px' }}>Proof of Work</span>
                          {isImage ? (
                            <img src={src} alt="Proof of work" style={{ width: '100%', borderRadius: '6px', objectFit: 'cover', maxHeight: '260px' }} />
                          ) : (
                            <a href={src} download={proof.fileName || 'proof'} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                              {proof.fileName || 'Download File'}
                            </a>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              </div>
            </div>
            <div className="offcanvas-footer">
              <button
                onClick={downloadReportAsPdf}
                disabled={isDownloadingPdf}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#8b5cf6', opacity: isDownloadingPdf ? 0.7 : 1, cursor: isDownloadingPdf ? 'not-allowed' : 'pointer' }}
              >
                {isDownloadingPdf ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                )}
                {isDownloadingPdf ? 'Generating PDF...' : 'Download as PDF'}
              </button>
            </div>
          </div>
        </>
      )}

      {isAssignOffcanvasOpen && selectedIssueToAssign && (        <div className="offcanvas-overlay" onClick={() => setIsAssignOffcanvasOpen(false)}>
          <div className="offcanvas-content" onClick={(e) => e.stopPropagation()}>
            <div className="offcanvas-header">
              <h2>Assign Task</h2>
              <div className="offcanvas-header-actions">
                <button className="btn-close" onClick={() => setIsAssignOffcanvasOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
            
            <div className="offcanvas-body" style={{ padding: '20px', overflowY: 'auto' }}>
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Task Details</h3>
                <p><strong>Category:</strong> {selectedIssueToAssign.category}</p>
                <p><strong>Description:</strong> {selectedIssueToAssign.description}</p>
              </div>

              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Available Specialists</h3>
              
              {(() => {
                const category = (selectedIssueToAssign.category || '').toLowerCase();
                const filteredUsers = maintenanceUsers.filter(u => {
                  if (!u.specialization) return false;
                  const spec = u.specialization.toLowerCase();
                  
                  // Furniture / Carpentry match
                  if ((spec.includes('carpen') || spec.includes('furn')) && (category.includes('furn') || category.includes('carpen'))) return true;
                  
                  // Plumbing match
                  if (spec.includes('plumb') && category.includes('plumb')) return true;
                  
                  // Electrical match
                  if (spec.includes('elect') && category.includes('elect')) return true;
                  
                  // Generic match
                  return spec.includes(category) || category.includes(spec);
                });

                if (filteredUsers.length === 0) {
                  return <p style={{ color: '#64748b', textAlign: 'center' }}>No specialized users available for this category.</p>;
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredUsers.map(u => (
                      <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{u.name}</div>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>{u.specialization}</div>
                        </div>
                        <button 
                          onClick={() => handleAssignUser(u._id)}
                          className="btn-submit"
                          style={{ padding: '6px 12px', height: 'auto', width: 'auto' }}
                        >
                          Assign
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
