// Interface-only translations. Korean exercises and glossary definitions remain original.
const rows = [
['Study','Học tập','学习','Учиться'],['Import & backup','Nhập và sao lưu','导入与备份','Импорт и резервная копия'],['Settings','Cài đặt','设置','Настройки'],['Language','Ngôn ngữ','语言','Язык'],
['Your Korean study shelf','Tủ sách tiếng Hàn của bạn','你的韩语书架','Ваша полка корейского языка'],['A little practice.','Luyện tập một chút.','每天练习一点。','Немного практики.'],['A little more confidence.','Tự tin hơn một chút.','每天自信一点。','Больше уверенности.'],['Choose your books, find your focus, and keep going.','Chọn sách, chọn nội dung và tiếp tục học.','选择教材和重点，继续学习。','Выберите учебники и тему и продолжайте учиться.'],['Resume unfinished session','Tiếp tục buổi học','Продолжить занятие','Продолжить занятие'],
['01 · Choose your books','01 · Chọn sách','01 · 选择教材','01 · Выберите учебники'],['02 · Choose your practice','02 · Chọn cách luyện tập','02 · 选择练习','02 · Выберите практику'],['Coming soon','Sắp có','即将推出','Скоро'],['Units','Bài học','单元','Разделы'],['None checked = all units','Không chọn = tất cả bài','不勾选表示全部单元','Ничего не выбрано = все разделы'],
['Vocabulary difficulty','Độ khó từ vựng','词汇难度','Уровень словаря'],['Standard · opening-page vocabulary','Cơ bản · từ vựng trang đầu','标准 · 首页面词汇','Стандартный · слова начальной страницы'],['Hard · other-page vocabulary','Nâng cao · từ vựng các trang khác','进阶 · 其他页面词汇','Сложный · слова других страниц'],['Vocabulary direction','Chiều luyện từ vựng','词汇方向','Направление перевода'],['Vocabulary mode','Chế độ từ vựng','词汇模式','Режим словаря'],['Multiple choice (4 options)','Trắc nghiệm (4 lựa chọn)','选择题（4个选项）','Выбор ответа (4 варианта)'],['Flashcards / self-mark','Thẻ từ / tự đánh giá','闪卡 / 自评','Карточки / самооценка'],['Typed answers','Nhập câu trả lời','输入答案','Ввод ответа'],['Mixed','Kết hợp','混合','Смешанный'],['Grammar length','Số câu ngữ pháp','语法题数','Число вопросов'],['Grammar pattern','Mẫu ngữ pháp','语法结构','Грамматическая конструкция'],['All patterns','Tất cả mẫu','全部结构','Все конструкции'],['All','Tất cả','全部','Все'],['Vocabulary Quiz','Kiểm tra từ vựng','词汇测验','Тест по лексике'],['Grammar Quiz','Kiểm tra ngữ pháp','语法测验','Тест по грамматике'],['Weak words','Từ cần ôn','薄弱词汇','Трудные слова'],
['Weak words: previously missed or flagged cards, ordered by lifetime miss rate. Flagged words also appear in your next vocabulary round.','Từ cần ôn: từ từng sai hoặc đã đánh dấu, xếp theo tỷ lệ sai. Từ đã đánh dấu cũng xuất hiện trong vòng tiếp theo.','薄弱词汇：答错或标记过的词，按累计错误率排序。标记词也会出现在下一轮练习中。','Трудные слова: ошибочные или отмеченные карточки по частоте ошибок. Отмеченные слова включаются в следующую тренировку.'],
['← Pause & return home','← Tạm dừng và về trang chủ','← 暂停并返回首页','← Пауза и на главную'],['Correct','Đúng','正确','Верно'],['Missed','Sai','错误','Ошибки'],['Remaining','Còn lại','剩余','Осталось'],['Check answer','Kiểm tra đáp án','检查答案','Проверить ответ'],['Your answer','Câu trả lời của bạn','你的答案','Ваш ответ'],['★ Practise this again','★ Ôn lại từ này','★ 再练一次','★ Повторить ещё'],['Show hint · Target grammar','Xem gợi ý · Ngữ pháp mục tiêu','显示提示 · 目标语法','Показать подсказку · Грамматика'],['Correct ✓','Đúng ✓','正确 ✓','Верно ✓'],['Keep practising — you’ll see this again.','Tiếp tục luyện tập — từ này sẽ xuất hiện lại.','继续练习——稍后会再次出现。','Продолжайте — этот вопрос повторится.'],['Continue →','Tiếp tục →','继续 →','Далее →'],['Got it ✓','Đã nhớ ✓','记住了 ✓','Знаю ✓'],['Missed ✗','Chưa nhớ ✗','没记住 ✗','Не знаю ✗'],
['Session complete','Đã hoàn thành','练习完成','Занятие завершено'],['Small steps, real progress.','Từng bước nhỏ, tiến bộ thật.','小步前进，真正进步。','Маленькие шаги, настоящий прогресс.'],['total cards','tổng số thẻ','张卡片','карточек всего'],['first-try accuracy','độ chính xác lần đầu','首次正确率','верно с первой попытки'],['all-attempt accuracy','độ chính xác tổng thể','总正确率','общая точность'],['Review list','Danh sách ôn tập','复习列表','Список повторения'],['Word / question','Từ / câu hỏi','词汇 / 问题','Слово / вопрос'],['Misses','Số lần sai','错误次数','Ошибки'],['No missed or flagged cards. Well done!','Không có từ sai hoặc đã đánh dấu. Giỏi lắm!','没有答错或标记的卡片。做得好！','Нет ошибок или отмеченных карточек. Отлично!'],['Practise missed words again','Ôn lại các từ sai','重练错词','Повторить ошибочные слова'],['Practise missed questions again','Làm lại các câu sai','重做错题','Повторить ошибочные вопросы'],['Practise everything again, including the ones I got right','Ôn lại tất cả, kể cả câu đúng','全部重练，包括答对的题','Повторить всё, включая верные ответы'],['Back to home','Về trang chủ','返回首页','На главную'],
['Make it yours','Theo cách của bạn','个性化设置','Настройте под себя'],['Study settings','Cài đặt học tập','学习设置','Настройки обучения'],['Correct streak needed (1–3)','Số lần đúng liên tiếp (1–3)','所需连续答对次数（1–3）','Верных ответов подряд (1–3)'],['Minimum cards before repeat','Số thẻ tối thiểu trước khi lặp lại','重复前最少卡片数','Минимум карточек до повтора'],['Maximum cards before repeat','Số thẻ tối đa trước khi lặp lại','重复前最多卡片数','Максимум карточек до повтора'],['Default direction','Chiều mặc định','默认方向','Направление по умолчанию'],['Default mode','Chế độ mặc định','默认模式','Режим по умолчанию'],['Self-mark','Tự đánh giá','自评','Самооценка'],['Typed','Nhập đáp án','输入','Ввод'],['Theme','Giao diện','主题','Тема'],['Follow system','Theo hệ thống','跟随系统','Как в системе'],['Light','Sáng','浅色','Светлая'],['Dark','Tối','深色','Тёмная'],['Save settings','Lưu cài đặt','保存设置','Сохранить настройки'],['Reset all progress','Xóa toàn bộ tiến độ','重置全部进度','Сбросить весь прогресс'],['Saved. New settings apply to your next session.','Đã lưu. Cài đặt mới áp dụng từ buổi sau.','已保存。新设置将在下一轮生效。','Сохранено. Настройки применятся в следующем занятии.'],['Minimum distance must not exceed maximum.','Khoảng cách tối thiểu không được lớn hơn tối đa.','最小间隔不能超过最大间隔。','Минимум не должен превышать максимум.'],['Progress reset.','Đã xóa tiến độ.','进度已重置。','Прогресс сброшен.'],
['Your own learning material','Tài liệu học của bạn','你自己的学习资料','Ваши учебные материалы'],['Target book','Sách đích','目标教材','Учебник'],['Paste book JSON','Dán JSON của sách','粘贴教材 JSON','Вставьте JSON учебника'],['Merge JSON','Nhập JSON','合并 JSON','Объединить JSON'],['Or upload vocabulary CSV','Hoặc tải lên CSV từ vựng','或上传词汇 CSV','Или загрузите CSV словаря'],['Keep a copy','Giữ một bản sao','保留副本','Сохраните копию'],['Export full backup','Xuất bản sao lưu đầy đủ','导出完整备份','Экспорт полной копии'],['Import backup','Nhập bản sao lưu','导入备份','Импорт копии'],['Imported successfully.','Đã nhập thành công.','导入成功。','Импорт выполнен.'],['Backup includes all loaded book content, imports, settings, and progress. Restoring replaces your saved data.','Bản sao lưu gồm nội dung sách, dữ liệu đã nhập, cài đặt và tiến độ. Khôi phục sẽ thay thế dữ liệu đã lưu.','备份包含教材、导入内容、设置和进度。恢复会替换已保存的数据。','Копия содержит учебники, импорт, настройки и прогресс. Восстановление заменяет сохранённые данные.'],['Unofficial personal study companion','Công cụ học cá nhân không chính thức','非官方个人学习工具','Неофициальный помощник для учёбы'],
['Enter: submit / next · 1–4: choose · Space: flip · J / ←: missed · K / →: got it','Enter: kiểm tra / tiếp · 1–4: chọn · Space: lật · J / ←: sai · K / →: đúng','Enter：提交 / 下一题 · 1–4：选择 · 空格：翻卡 · J / ←：未记住 · K / →：已记住','Enter: ответ / далее · 1–4: выбор · Пробел: переворот · J / ←: не знаю · K / →: знаю']
];
rows.push(
 ['Click or press Space to reveal','Nhấp hoặc nhấn Space để xem đáp án','点击或按空格显示答案','Нажмите или используйте пробел для ответа'],
 ['Choose the correct English meaning','Chọn nghĩa tiếng Anh đúng','选择正确的英语释义','Выберите верное значение на английском'],
 ['Choose the correct Korean word','Chọn từ tiếng Hàn đúng','选择正确的韩语词汇','Выберите верное корейское слово'],
 ['Cards completed','Số thẻ đã hoàn thành','已完成卡片','Завершённые карточки']
);
// Correct a native-language label separately for readability above.
rows.find(r=>r[0]==='Resume unfinished session')[2]='继续未完成的练习';
rows.push(
 ['Click or press Space to reveal','Nhấp hoặc nhấn Space để xem','点击或按空格显示','Нажмите или используйте пробел'],
 ['Choose the correct English meaning','Chọn nghĩa tiếng Anh đúng','选择正确的英语释义','Выберите верное значение на английском'],
 ['Choose the correct Korean word','Chọn từ tiếng Hàn đúng','选择正确的韩语词汇','Выберите верное корейское слово'],
 ['작은 연습, 큰 변화 · A little practice, every day.','작은 연습, 큰 변화 · Luyện tập một chút mỗi ngày.','작은 연습, 큰 변화 · 每天练习一点。','작은 연습, 큰 변화 · Немного практики каждый день.'],
 ['Columns: book, unit, ko, en, example. Book must match your selection. Matching IDs replace existing entries.','Các cột: book, unit, ko, en, example. Sách phải khớp lựa chọn. ID trùng sẽ thay thế mục cũ.','列：book、unit、ko、en、example。教材须与选择一致。相同 ID 会替换原有条目。','Столбцы: book, unit, ko, en, example. Учебник должен совпадать с выбранным. Совпадающие ID заменяют записи.']
);
const dictionaries=Object.fromEntries(['en','vi','zh','ru'].map((lang,i)=>[lang,Object.fromEntries(rows.map(r=>[r[0],r[i]]))]));
export function translateText(text,lang='en'){
 const trimmed=text.trim(),dict=dictionaries[lang]||dictionaries.en;
 if(dict[trimmed])return text.replace(trimmed,dict[trimmed]);
 if(lang==='en')return text;
 const bookProgress=trimmed.match(/^(\d+)% vocab mastered · (.*?) grammar accuracy$/);
 if(bookProgress){const [_,v,g]=bookProgress;return {vi:`${v}% từ đã nhớ · ${g} ngữ pháp đúng`,zh:`词汇掌握 ${v}% · 语法正确率 ${g}`,ru:`Освоено слов: ${v}% · Точность грамматики: ${g}`}[lang];}
 const practice=trimmed.match(/^(\w+) · (Standard vocabulary|Hard vocabulary|Grammar) practice$/);
 if(practice){const names={vi:['Từ vựng cơ bản','Từ vựng nâng cao','Ngữ pháp'],zh:['标准词汇','进阶词汇','语法'],ru:['Стандартный словарь','Сложный словарь','Грамматика']};return `${practice[1]} · ${names[lang][['Standard vocabulary','Hard vocabulary','Grammar'].indexOf(practice[2])]}`;}
 const grammarUnit=trimmed.match(/^Grammar · Unit (\d+)$/);
 if(grammarUnit)return {vi:`Ngữ pháp · Bài ${grammarUnit[1]}`,zh:`语法 · 单元 ${grammarUnit[1]}`,ru:`Грамматика · Раздел ${grammarUnit[1]}`}[lang];
 const progress=trimmed.match(/^(\d+)% vocab mastered · (.*) grammar accuracy$/);
 if(progress){const p={vi:`${progress[1]}% từ đã thuộc · ${progress[2]} độ chính xác ngữ pháp`,zh:`词汇掌握 ${progress[1]}% · 语法正确率 ${progress[2]}`,ru:`Освоено слов: ${progress[1]}% · Точность грамматики: ${progress[2]}`};return p[lang];}
 const count=trimmed.match(/^(\d+) words · (.*)$/);
 if(count){const hard=count[2].startsWith('Extra ');const labels={vi:[`${count[1]} từ · Chỉ từ vựng ở khung cuối trang đầu mỗi bài nhỏ.`,`${count[1]} từ · Từ vựng Hàn–Anh ở cuối các trang còn lại.`],zh:[`${count[1]} 个词 · 仅每小节首页底部词汇框。`,`${count[1]} 个词 · 其他页面底部的韩英词汇注释。`],ru:[`${count[1]} слов · Только нижний словарь начальной страницы подраздела.`,`${count[1]} слов · Корейско-английские примечания на остальных страницах.`]};return labels[lang][hard?1:0];}
 return text;
}
let initialized=false;
export function initLanguage(){
 if(initialized)return;initialized=true;
 let language='en';try{const saved=localStorage.getItem('snu-interface-language');if(dictionaries[saved])language=saved;}catch{}
 const label=document.createElement('label');label.className='language-switch';label.innerHTML='<span>Language</span><select id="interface-language" aria-label="Language"><option value="en">English</option><option value="vi">Tiếng Việt</option><option value="zh">中文</option><option value="ru">Русский</option></select>';
 document.querySelector('header').append(label);const select=label.querySelector('select');select.value=language;
 const originals=new WeakMap();
 const excluded='.choices,#reveal,.flashcard span,[lang="ko"],.grammar-hint > div,.source-note,textarea,script,style,#interface-language,.feedback p';
 function apply(){
  observer.disconnect();document.documentElement.lang=language;
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
  while(node=walker.nextNode()){
   if(!node.parentElement||node.parentElement.closest(excluded)||!node.textContent.trim())continue;
   const prior=originals.get(node);let original=prior&&node.textContent===prior.translated?prior.original:node.textContent;
   const translated=translateText(original,language);originals.set(node,{original,translated});if(node.textContent!==translated)node.textContent=translated;
  }
  select.setAttribute('aria-label',dictionaries[language].Language);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
 }
 const observer=new MutationObserver(apply);
 select.onchange=()=>{language=select.value;try{localStorage.setItem('snu-interface-language',language);}catch{}apply();};
 apply();
}
