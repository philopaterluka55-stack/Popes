let fullData = [];

// 1. بدء تشغيل معالجة الأزرار وتحميل البيانات فور تجهيز عناصر الصفحة
document.addEventListener('DOMContentLoaded', () => {
  initBioButtons();
  loadDataset();
});

// 2. تحميل ملف الداتا ست dataset_cleaned.json
function loadDataset() {
  fetch('dataset_cleaned.json')
    .then(response => {
      if (!response.ok) throw new Error("تعذر فتح ملف dataset_cleaned.json");
      return response.json();
    })
    .then(data => {
      fullData = data;
      console.log("✅ تم تحميل الداتا ست بنجاح! عدد المقالات:", fullData.length);
    })
    .catch(error => {
      console.error("❌ خطأ عند تحميل البيانات:", error);
    });
}

// 3. وضع أزرار "عرض السيرة" في الخلية الخامسة أوتوماتيكياً لكل صف
function initBioButtons() {
  const rows = document.querySelectorAll('#PopesTable tbody tr');

  rows.forEach(row => {
    // تخطي صفوف عناوين القرون (التي تحتوي على أقل من 4 خلايا)
    if (row.cells.length >= 4) {
      const patriarchName = row.cells[1].innerText.trim();
      const safeName = patriarchName.replace(/'/g, "\\'");

      const buttonHTML = `
        <button class="btn-bio" onclick="openBio('${safeName}')" style="cursor:pointer; padding:5px 10px; background-color:#800000; color:#fff; border:none; border-radius:4px;">
          عرض السيرة
        </button>
      `;

      if (row.cells.length >= 5) {
        row.cells[4].innerHTML = buttonHTML;
        row.cells[4].style.textAlign = 'center';
      } else {
        const btnCell = row.insertCell(-1);
        btnCell.style.textAlign = 'center';
        btnCell.innerHTML = buttonHTML;
      }
    }
  });
}

// 4. تنظيف وتوحيد النصوص لتجاوز اختلاف الهمزات والأرقام والأقواس والألقاب
function normalizeText(str) {
  if (!str) return '';
  return str
    .replace(/\(.*?\)/g, '')                     // مسح كل ما بين الأقواس مثل (مارمرقس الرسول)
    .replace(/[0-9]/g, '')                       // مسح الأرقام
    .replace(/^(البابا|أنبا|مار|ماري)\s+/g, '')// مسح الألقاب من بداية الاسم
    .replace(/[أإآ]/g, 'ا')                      // توحيد الألف
    .replace(/ى/g, 'ي')                          // توحيد الياء
    .replace(/ة/g, 'ه')                          // توحيد التاء المربوطة
    .replace(/\s+/g, ' ')                        // توحيد المسافات
    .trim()
    .toLowerCase();
}

// 5. البحث في الـ JSON وعرض السيرة داخل النافذة المنبثقة مع إخفاء الروابط
function openBio(rawName) {
  const modal = document.getElementById('modal');
  const titleElem = document.getElementById('bioTitle');
  const textElem = document.getElementById('bioText');

  titleElem.innerText = rawName;

  // التأكد من استلام البيانات من الملف
  if (!fullData || fullData.length === 0) {
    textElem.innerText = '⚠️ جاري تحميل البيانات... تأكد من تشغيل المشروع عبر Live Server داخل VS Code.';
    modal.style.display = 'block';
    return;
  }

  const searchKey = normalizeText(rawName);

  
  const item = fullData.find(entry => {
    if (!entry.content) return false;
    const cleanContent = normalizeText(entry.content);
    return cleanContent.includes(searchKey);
  });

  if (item && item.content) {
    
    const cleanBioText = item.content.replace(/https?:\/\/[^\s]+/g, '').trim();
    textElem.innerText = cleanBioText;
  } else {
    textElem.innerText = 'السيرة التفصيلية غير متوفرة حالياً لهذه الشخصية في الداتا ست.';
  }

  modal.style.display = 'block';
}


function filterPopes() {
  const input = document.getElementById('patriarchSearch').value;
  const searchKey = normalizeText(input);
  const rows = document.querySelectorAll('#PopesTable tbody tr');

  rows.forEach(row => {
    
    if (row.cells.length < 4) return;

    const rowText = normalizeText(row.innerText);
    if (rowText.includes(searchKey)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}


function closeModal() {
  document.getElementById('modal').style.display = 'none';
}


window.onclick = function(event) {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    closeModal();
  }
};