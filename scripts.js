document.getElementById("currentDate").textContent = formatDate(
    new Date()
);

let rowCount = 0;

// Function to format date as dd/mm/yy
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/20${year}`;
}

// Function to add a new row
function addNewRow() {
    rowCount++;
    const tbody = document.querySelector("#invoiceTable tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td class="text-center">${rowCount}</td>
        <td><input type="text" class="form-control particulars" required></td>
        <td><input type="number" class="form-control quantity" step="0.01" min="0"></td>
        <td><input type="number" class="form-control rate" step="0.01" min="0"></td>
        <td><input type="number" class="form-control amount"></td>
    `;
    tbody.appendChild(row);

    const quantityInput = row.querySelector(".quantity");
    const rateInput = row.querySelector(".rate");
    const amountInput = row.querySelector(".amount");

    // Event listeners for quantity/rate inputs
    quantityInput.addEventListener("input", () =>
        handleRowInput(row)
    );
    rateInput.addEventListener("input", () => handleRowInput(row));

    // Event listener for direct amount input (only allowed when qty/rate are empty)
    amountInput.addEventListener("input", () => {
        if (!quantityInput.value && !rateInput.value) {
            updateGrandTotal();
        }
    });
}

// Function to handle row input changes
function handleRowInput(row) {
    const quantity =
        parseFloat(row.querySelector(".quantity").value) || 0;
    const rate = parseFloat(row.querySelector(".rate").value) || 0;
    const amountInput = row.querySelector(".amount");

    // If BOTH quantity and rate are empty, allow editing amount
    if (quantity === 0 && rate === 0) {
        amountInput.readOnly = false;
        // amountInput.value = ""; // Clear amount
    } else {
        // Calculate amount if at least one value exists
        const amount = quantity * rate;
        amountInput.value = amount.toFixed(2);
        amountInput.readOnly = true; // Lock amount
    }

    updateGrandTotal();
}

// Function to update the grand total
function updateGrandTotal() {
    const amounts = document.querySelectorAll(".amount");
    let total = 0;
    amounts.forEach((input) => {
        total += parseFloat(input.value) || 0;
    });

    const deduction =
        parseFloat(document.getElementById("deduction").value) || 0;
    document.getElementById(
        "grandTotal"
    ).textContent = `₹${total.toFixed(2)}`;
    document.getElementById("netTotal").textContent = `₹${(
        total - deduction
    ).toFixed(2)}`;
}

// Event listener for deduction input
document
    .getElementById("deduction")
    .addEventListener("input", updateGrandTotal);

// Function to generate PDF
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("times");
    doc.setTextColor(0, 0, 0); 

    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("Mobile: 9867924687", 190, 15, { align: "right" });

    doc.setFontSize(26);
    doc.setTextColor(220, 53, 69); // Red color
    doc.text("SHIVAM FURNITURE", 105, 25, { align: "center" });

    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0); // Dark blue
    doc.text(
        "Specialists: Furniture, Aluminum Sliding, Painting, POP, Polish & All kinds of Civil Work",
        105,
        35,
        { align: "center" }
    );

    // First Horizontal Line (Red)
    doc.setLineWidth(0.3);
    doc.setTextColor(0, 0, 0);
    doc.line(0, 40, 210, 40);

    // Address Line (Dark Blue)
    doc.setFontSize(12);
    doc.text("Shiv Chatrapati Chawl, Surya Nagar, Near Police Station, Vikhroli West, Mumbai-400083", 105, 47, {
        align: "center"
    });

    // Second Horizontal Line (Red)
    doc.line(0, 52, 210, 52);

    // Date (Right Aligned - Dark Blue)
    doc.setTextColor(0, 0, 0); // Dark blue
    doc.text(`Date: ${formatDate(new Date())}`, 190, 60, { align: "right" });

    // Add a bit of space after the date
    doc.text(" ", 105, 50);

    // Table data preparation
    const body = [];
    document
        .querySelectorAll("#invoiceTable tbody tr")
        .forEach((row) => {
            const particulars =
                row.querySelector(".particulars").value;
            const quantity = row.querySelector(".quantity").value;
            const rate = row.querySelector(".rate").value;
            const amount = row.querySelector(".amount").value;

            // If rate and quantity are empty, only show particulars and amount
            if (!quantity && !rate) {
                body.push([
                    row.cells[0].textContent,
                    particulars,
                    "", // Empty quantity
                    "", // Empty rate
                    amount,
                ]);
            } else {
                body.push([
                    row.cells[0].textContent,
                    particulars,
                    quantity,
                    rate,
                    amount,
                ]);
            }
        });

    // Add total, deduction, and net total rows
    body.push(
        [
            {
                content: "Total Amount",
                colSpan: 4,
                styles: { halign: "right", fontStyle: "bold" },
            },
            `${document
                .getElementById("grandTotal")
                .textContent.replace("₹", "")}`,
        ],
        [
            {
                content: "Advance Paid",
                colSpan: 4,
                styles: { halign: "right", fontStyle: "bold" },
            },
            `${document.getElementById("deduction").value}`,
        ],
        [
            {
                content: "Final Payable",
                colSpan: 4,
                styles: { halign: "right", fontStyle: "bold" },
            },
            `${document
                .getElementById("netTotal")
                .textContent.replace("₹", "")}`,
        ]
    );

    // Table styling
    doc.autoTable({
        startY: 70,
        head: [
            ["Sr No", "Particulars", "Quantity", "Rate", "Amount"],
        ],
        body: body,
        theme: "grid",
        styles: {
            font: "times",
            fontSize: 11,
            cellPadding: 3,
            halign: "center",
            valign: "middle",
            lineColor: [0, 0, 0],
            lineWidth: 0.2,
        },
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: 0,
            font: "times",
            fontSize: 12,
            fontStyle: "bold",
            cellPadding: 4,
            halign: "center",
        },
        bodyStyles: {
            fillColor: [245, 245, 245],
            lineColor: [0, 0, 0],
            lineWidth: 0.3,
            textColor: 0,
        },
        alternateRowStyles: {
            fillColor: [255, 255, 255],
            textColor: 0,
        },
        columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: "auto", halign: "left" },
            2: { cellWidth: 26 },
            3: { cellWidth: 28 },
            4: { cellWidth: 36 },
        },
        margin: { horizontal: 5 },
        didDrawPage: (data) => {
            // Add page number in footer
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(10);
            doc.text(
                `Page ${data.pageNumber} of ${pageCount}`,
                105,
                doc.internal.pageSize.height - 10,
                { align: "center" }
            );
        },
    });

    // Save the PDF with a filename
    doc.save(`invoice_${new Date().getTime()}.pdf`);
}

// Add initial row
addNewRow();
