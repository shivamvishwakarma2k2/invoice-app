
document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString();

let rowCount = 0;

function addNewRow() {
    rowCount++;
    const tbody = document.querySelector("#invoiceTable tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
    <td class="text-center">${rowCount}</td>
    <td><input type="text" class="form-control particulars" required></td>
    <td><input type="number" class="form-control quantity" step="0.01" min="0"></td>
    <td><input type="number" class="form-control rate" step="0.01" min="0"></td>
    <td><input type="number" class="form-control amount" readonly></td>
`;
    tbody.appendChild(row);

    row.querySelector(".quantity").addEventListener(
        "input",
        updateAmount
    );
    row.querySelector(".rate").addEventListener(
        "input",
        updateAmount
    );
}

function updateAmount(event) {
    const row = event.target.closest("tr");
    const quantity =
        parseFloat(row.querySelector(".quantity").value) || 0;
    const rate = parseFloat(row.querySelector(".rate").value) || 0;
    const amount = quantity * rate;
    row.querySelector(".amount").value = amount.toFixed(2);
    updateGrandTotal();
}

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

document
    .getElementById("deduction")
    .addEventListener("input", updateGrandTotal);

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont("times");

    // Header - SHIVAM FURNITURE
    doc.setFontSize(28);
    doc.setTextColor(220, 53, 69); // Dark red
    doc.setFont("times", "bold"); // Make the text bold
    doc.text("SHIVAM FURNITURE", 105, 25, { align: "center" });

    // Tagline under the main title
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0); // Black color
    doc.setFont("times", "bold"); // Make the text bold
    doc.text(
        "Specialists: Furniture, Aluminum Sliding, Painting, POP, Polish & All kinds of Civil Work",
        105,
        35,
        { align: "center" }
    );

    // Mobile number under the tagline
    doc.setFontSize(12);
    doc.setFont("times", "bold"); // Make the text bold
    doc.text("Mobile: 9867924687", 105, 45, { align: "center" });

    // Horizontal line below header section
    doc.setLineWidth(0.3);
    doc.setTextColor(220, 53, 69);
    doc.line(0, 50, 210, 50);

    // Right-aligned Date
    doc.setFontSize(12);
    doc.setFont("times", "bold"); // Make the text bold
    doc.setTextColor(0, 0, 0); // Black color
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 190, 60, {
        align: "right",
    });

    // Add a bit of space after the date
    doc.text(" ", 105, 50);

    // Table data preparation
    const body = [];
    document
        .querySelectorAll("#invoiceTable tbody tr")
        .forEach((row) => {
            body.push([
                row.cells[0].textContent,
                row.querySelector(".particulars").value,
                row.querySelector(".quantity").value,
                row.querySelector(".rate").value,
                row.querySelector(".amount").value,
            ]);
        });

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
                styles: { halign: "right", fontStyle: "bold"},
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
            textColor: 0, // White text color
            font: "times",
            fontSize: 12,
            fontStyle: "bold",
            cellPadding: 4,
            halign: "center",
        },
        bodyStyles: {
            fillColor: [245, 245, 245], // Light gray background for rows
            lineColor: [0, 0, 0],
            lineWidth: 0.3,
            textColor: 0,
        },
        alternateRowStyles: {
            fillColor: [255, 255, 255], // White background for alternate rows
            textColor: 0,
        },
        columnStyles: {
            0: { cellWidth: 15 }, // Sr No column width
            1: { cellWidth: "auto", halign: "left" }, // Particulars column width
            2: { cellWidth: 26 }, // Quantity column width
            3: { cellWidth: 28 }, // Rate column width
            4: { cellWidth: 36 }, // Amount column width
        },
        margin: { horizontal: 5 },
    });

    // Footer - Page number
    doc.setFontSize(10);
    doc.text(
        "--- Page 1 ---",
        105,
        doc.autoTable.previous.finalY + 20,
        {
            align: "center",
        }
    );

    // Save the PDF with a filename
    doc.save(`invoice_${new Date().getTime()}.pdf`);
}

// Add initial row
addNewRow();


