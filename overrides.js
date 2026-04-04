"use strict";

function buildQuestions(profile) {
  const goalType = detectGoalType(profile.goal);
  const targetLabel = goalType === "skill" ? "kỹ năng" : goalType === "work" ? "công việc" : "học tập";
  const goalText = profile.goal || `mục tiêu ${targetLabel}`;
  const focusTime = profile.focusTime || "khung giờ bạn tỉnh táo nhất";
  const freeTime = profile.freeTime || "quỹ thời gian hiện có";

  return [
    {
      type: "radio",
      prompt: `Với mục tiêu "${goalText}", mức hiện tại của bạn đang ở đâu?`,
      options: [
        "Mới bắt đầu, chưa có nền",
        "Đã có nền tảng cơ bản",
        "Đang ở mức trung bình",
        "Đã khá tốt, muốn bứt phá",
      ],
    },
    {
      type: "radio",
      prompt: "Rào cản lớn nhất đang làm chậm tiến độ của bạn là gì?",
      options: [
        "Thiếu thời gian ổn định",
        "Dễ xao nhãng, mất tập trung",
        "Thiếu lộ trình hoặc kiến thức nền",
        "Áp lực học, việc hoặc cá nhân",
      ],
    },
    {
      type: "radio",
      prompt: `Điều gì khiến bạn dễ mất động lực với "${goalText}" nhất?`,
      options: [
        "Không thấy tiến bộ nên nản",
        "Task quá khó nên ngại bắt đầu",
        "Làm lâu là tụt hứng",
        "Việc khác kéo ngang ưu tiên",
      ],
    },
    {
      type: "radio",
      prompt: `Trong ${focusTime}, bạn muốn AI ưu tiên nhóm nhiệm vụ nào nhất?`,
      options: [
        "Task khó cần tập trung sâu",
        "Task thực hành hoặc làm bài",
        "Task ôn tập, tổng hợp, ghi chú",
        "Task linh hoạt theo từng ngày",
      ],
    },
    {
      type: "radio",
      prompt: `Dựa trên quỹ thời gian "${freeTime}", bạn muốn phân bổ lịch theo kiểu nào?`,
      options: [
        "Chia đều để giữ nhịp",
        "Dồn phiên sâu vào vài buổi",
        "Linh hoạt theo ngày bận rảnh",
        "Ít việc nhưng làm thật chắc",
      ],
    },
    {
      type: "radio",
      prompt: "Thói quen nào khiến bạn dễ trượt kế hoạch nhất?",
      options: [
        "Trì hoãn khi task quá lớn",
        "Chỉ làm khi có cảm hứng",
        "Ôm quá nhiều việc cùng lúc",
        "Thiếu nghỉ ngơi nên nhanh hụt pin",
      ],
    },
    {
      type: "radio",
      prompt: "Sau 4 tuần, bạn kỳ vọng đầu ra nào rõ nhất?",
      options: [
        "Xong một mốc nền tảng quan trọng",
        "Đều hơn và hiệu suất tốt hơn",
        "Có kết quả hoặc sản phẩm cụ thể",
        "Có lịch ổn định và bền hơn",
      ],
    },
    {
      type: "radio",
      prompt: "Bạn muốn AI đồng hành theo kiểu nào?",
      options: [
        "Nhắc kỷ luật và bám tiến độ",
        "Nhắc lý do học để giữ lửa",
        "Cân bằng hiệu suất và sức bền",
        "Linh hoạt theo tình hình thực tế",
      ],
    },
  ];
}

function normalizeQuestions(questions, fallbackQuestions) {
  const normalized = questions
    .filter((question) => question && typeof question.prompt === "string")
    .map((question) => ({
      type: "radio",
      prompt: question.prompt.trim(),
      options: Array.isArray(question.options)
        ? question.options.map((option) => String(option).trim()).filter(Boolean).slice(0, 4)
        : [],
    }))
    .filter((question) => question.prompt && question.options.length >= 4)
    .slice(0, 8)
    .map((question) => ({
      ...question,
      options: question.options.slice(0, 4),
    }));

  return normalized.length >= 8 ? normalized : fallbackQuestions;
}

function normalizeAnalysis(analysis) {
  return {
    summary: analysis.summary || "Chưa có tóm tắt.",
    feasibility: analysis.feasibility || "Trung bình",
    motivation: Array.isArray(analysis.motivation) ? analysis.motivation : [],
    strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
    improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
    habits: Array.isArray(analysis.habits) ? analysis.habits : [],
    nextActions: Array.isArray(analysis.nextActions) ? analysis.nextActions : [],
    risks: Array.isArray(analysis.risks) ? analysis.risks : [],
    roadmap: Array.isArray(analysis.roadmap) ? analysis.roadmap.map((step) => ({
      week: step.week || "Tuần",
      goal: step.goal || "Chưa có mục tiêu tuần.",
      focus: Array.isArray(step.focus) ? step.focus : [],
    })) : [],
  };
}

function renderAnalysis() {
  if (!isLoggedIn()) {
    els.analysisContent.className = "empty-state";
    els.analysisContent.textContent = "Đăng nhập để nhận phân tích AI và lưu lịch sử theo tài khoản.";
    return;
  }

  if (!state.analysis) {
    els.analysisContent.className = "empty-state";
    els.analysisContent.textContent = "Hoàn thành khảo sát để nhận phân tích về thói quen, động lực và mức độ khả thi.";
    return;
  }

  const motivationItems = (state.analysis.motivation || []).map((item) => `<li>${item}</li>`).join("");
  els.analysisContent.className = "";
  els.analysisContent.innerHTML = `
    <p>${state.analysis.summary}</p>
    <div class="analysis-grid">
      <article class="analysis-block">
        <h4>Động lực hiện tại</h4>
        <ul>${motivationItems || "<li>Chưa có dữ liệu động lực cụ thể.</li>"}</ul>
      </article>
      <article class="analysis-block">
        <h4>Nhận xét thói quen</h4>
        <ul>${state.analysis.habits.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article class="analysis-block">
        <h4>Điểm mạnh</h4>
        <ul>${state.analysis.strengths.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article class="analysis-block">
        <h4>Điểm cần cải thiện</h4>
        <ul>${state.analysis.improvements.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article class="analysis-block">
        <h4>Mức độ khả thi</h4>
        <ul>
          <li>Mục tiêu hiện tại được đánh giá ở mức <strong>${state.analysis.feasibility}</strong>.</li>
          <li>Duy trì nhật ký hằng ngày sẽ giúp AI cập nhật phân tích chính xác hơn.</li>
        </ul>
      </article>
      <article class="analysis-block">
        <h4>Việc cần làm ngay</h4>
        <ul>${(state.analysis.nextActions || []).map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article class="analysis-block">
        <h4>Rủi ro chính</h4>
        <ul>${(state.analysis.risks || []).map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
    </div>
    <div class="analysis-roadmap">
      ${(state.analysis.roadmap || []).map((step) => `
        <article class="analysis-block roadmap-block">
          <h4>${step.week}</h4>
          <p><strong>Mục tiêu:</strong> ${step.goal}</p>
          <ul>${(step.focus || []).map((item) => `<li>${item}</li>`).join("")}</ul>
        </article>
      `).join("")}
    </div>
  `;
}

function getAnswerValue(answers, index, fallback = "chưa xác định rõ") {
  return Object.values(answers || {})[index] || fallback;
}

function detectMotivationState(profile, answers) {
  const values = Object.values(answers || {});
  const combined = `${profile.goal || ""} ${(profile.strengthsWeaknesses || "")} ${values.join(" ")}`.toLowerCase();
  const motivationAnswer = getAnswerValue(answers, 2);
  const weaknessAnswer = getAnswerValue(answers, 5);
  const supportMode = getAnswerValue(answers, 7);
  const lowSignals = [
    "mất động lực",
    "không thấy tiến bộ",
    "nản",
    "ngại bắt đầu",
    "tụt hứng",
    "chỉ làm khi có cảm hứng",
    "trì hoãn",
  ];
  const isLow = lowSignals.some((signal) => combined.includes(signal));

  if (isLow) {
    return {
      isLow: true,
      label: "động lực chưa ổn định",
      summary: `điểm hụt chính nằm ở "${motivationAnswer.toLowerCase()}"`,
      drivers: [
        `Bạn dễ hụt lửa khi gặp trạng thái "${motivationAnswer.toLowerCase()}".`,
        `Thói quen "${weaknessAnswer.toLowerCase()}" đang làm kế hoạch khó bền.`,
        supportMode.toLowerCase().includes("lý do học")
          ? "Bạn cần được nhắc lại lý do học/làm và ghi nhận tiến bộ ngắn hạn."
          : "Bạn cần cơ chế nhìn thấy tiến bộ ngắn hạn thay vì chỉ nhìn mục tiêu lớn.",
      ],
    };
  }

  return {
    isLow: false,
    label: "động lực tương đối ổn",
    summary: "động lực hiện tại chưa phải điểm nghẽn lớn nhất",
    drivers: [
      "Động lực hiện tại vẫn đủ để giữ nhịp nếu kế hoạch không quá tải.",
      "Cần giữ cảm giác tiến bộ mỗi tuần để tránh tụt nhịp giữa chừng.",
    ],
  };
}

function analyzeJournalMomentum(journal) {
  const recent = Array.isArray(journal) ? journal.slice(0, 5) : [];
  const completed = recent.filter((entry) => entry.status === "Hoàn thành").length;
  const lowEfficiency = recent.filter((entry) => entry.efficiency === "Thấp").length;
  const highEfficiency = recent.filter((entry) => entry.efficiency === "Cao").length;
  const stalled = recent.some((entry) => String(entry.done || "").trim().length < 12);

  if (!recent.length) {
    return {
      trend: "chưa có dữ liệu",
      note: "Chưa có dữ liệu giai đoạn 4, nên kế hoạch đang bám chủ yếu vào khảo sát và hồ sơ ban đầu.",
      adjustment: "Giữ kế hoạch nền tảng và bắt đầu ghi nhật ký đều mỗi ngày.",
    };
  }

  if (completed >= 3 && highEfficiency >= 2) {
    return {
      trend: "đà tiến triển tốt",
      note: "Dữ liệu nhật ký gần đây cho thấy bạn vẫn giữ được đà tương đối tốt.",
      adjustment: "Có thể tăng nhẹ độ khó ở các ngày sau nhưng vẫn giữ một điểm chốt tiến bộ mỗi ngày.",
    };
  }

  if (lowEfficiency >= 2 || completed <= 1 || stalled) {
    return {
      trend: "đà đang hụt",
      note: "Nhật ký giai đoạn 4 cho thấy nhịp thực thi đang chậm hoặc chưa ổn định.",
      adjustment: "Các ngày tiếp theo nên giảm độ nặng mở đầu, thêm task ngắn để lấy lại nhịp và cảm giác hoàn thành.",
    };
  }

  return {
    trend: "đà trung bình",
    note: "Nhật ký cho thấy bạn có tiến triển nhưng nhịp chưa đủ đều.",
    adjustment: "Các ngày tiếp theo nên giữ khối lượng vừa phải và chốt một kết quả nhỏ mỗi ngày.",
  };
}

function generateSmartAnalysis(profile, answers, journal) {
  const freeTime = (profile.freeTime || "").toLowerCase();
  const focusTime = profile.focusTime || "khung giờ chưa xác định";
  const completionScore = calculateCompletionRate(journal);
  const currentLevel = getAnswerValue(answers, 0);
  const mainBarrier = getAnswerValue(answers, 1);
  const motivationState = getAnswerValue(answers, 2);
  const focusTaskType = getAnswerValue(answers, 3);
  const preferredStyle = getAnswerValue(answers, 4);
  const mainWeakness = getAnswerValue(answers, 5);
  const fourWeekGoal = getAnswerValue(answers, 6);
  const aiSupportMode = getAnswerValue(answers, 7);
  const realism = assessGoalRealism(profile.goal, currentLevel, fourWeekGoal, freeTime);
  const motivation = detectMotivationState(profile, answers);
  const momentum = analyzeJournalMomentum(journal);

  return {
    summary: `Mục tiêu "${profile.goal || "chưa nêu rõ"}" hiện được đánh giá ở mức ${realism.feasibility.toLowerCase()}. ${realism.reason} Về động lực, bạn đang ở trạng thái ${motivation.label}: ${motivation.summary}. ${momentum.note} Điểm quan trọng là bạn chưa cần làm hoàn hảo ngay; bạn cần một chuỗi tiến bộ đủ nhỏ để tiếp tục đi tới mục tiêu thật của mình.`,
    feasibility: realism.feasibility,
    motivation: motivation.drivers,
    strengths: [
      `Bạn đã mô tả khá rõ mục tiêu hiện tại là "${profile.goal || "chưa nêu rõ"}".`,
      `Bạn tự đánh giá hiện trạng ở mức "${currentLevel.toLowerCase()}".`,
      profile.strengthsWeaknesses
        ? `Nền tảng có thể tận dụng: ${profile.strengthsWeaknesses}.`
        : "Bạn đã có dữ liệu ban đầu để bắt đầu tối ưu kế hoạch.",
      `Bạn có khung giờ ưu tiên là ${focusTime}.`,
      momentum.trend === "đà tiến triển tốt"
        ? "Nhật ký gần đây cho thấy bạn vẫn có khả năng giữ nhịp khi kế hoạch đủ rõ."
        : "Bạn vẫn có khả năng tiến lên nếu kế hoạch được chia nhỏ đúng mức.",
    ],
    improvements: [
      `Rào cản chính hiện tại là "${mainBarrier.toLowerCase()}". Kế hoạch phải xử lý thẳng điểm nghẽn này.`,
      `Thói quen dễ làm trượt kế hoạch nhất là "${mainWeakness.toLowerCase()}".`,
      motivation.isLow
        ? `Động lực đang là điểm nghẽn thật sự, không nên tiếp tục học/làm kiểu nặng khi chưa xử lý "${motivationState.toLowerCase()}".`
        : "Cần giữ nhịp đều để động lực không tụt sau vài ngày đầu.",
      realism.adjustment,
      momentum.adjustment,
      completionScore < 50
        ? "Tỷ lệ hoàn thành còn thấp, nên thêm bước tự check cuối ngày để giữ cam kết."
        : "Đã có dữ liệu nhật ký, nên dùng nó để chỉnh khối lượng công việc.",
    ],
    habits: [
      `Bạn hiệu quả nhất quanh ${focusTime}.`,
      `Bạn thiên về kiểu phân bổ lịch: ${preferredStyle.toLowerCase()}.`,
      `Trong giờ mạnh nhất nên ưu tiên: ${focusTaskType.toLowerCase()}.`,
      motivation.isLow
        ? "Bạn có xu hướng tụt nhịp khi chưa thấy tiến bộ đủ sớm."
        : "Bạn có thể giữ nhịp tốt hơn nếu mỗi tuần có một đầu ra rõ ràng.",
      journal.length
        ? `Nhật ký hiện tại cho thấy tỷ lệ hoàn thành khoảng ${completionScore}%.`
        : "Chưa có đủ dữ liệu nhật ký nên phân tích hành vi mới ở mức khởi tạo.",
    ],
    nextActions: motivation.isLow
      ? [
          `Chốt lại một mốc 7 ngày đủ nhỏ, bám vào "${fourWeekGoal.toLowerCase()}".`,
          "Chuẩn bị một phiên khởi động 10 phút với việc dễ nhất để vượt ì.",
          "Viết ra 1 lý do học/làm cụ thể và đặt ở nơi dễ thấy trước giờ bắt đầu.",
          "Tự chấm cuối ngày: hôm nay mình đã tiến thêm được gì dù rất nhỏ.",
          `Tách một đầu việc nhỏ nhất liên quan đến "${profile.goal || "mục tiêu hiện tại"}" và làm ngay trong 24 giờ tới.`,
        ]
      : [
          `Chốt lại một mốc 4 tuần đo được, bám vào "${fourWeekGoal.toLowerCase()}".`,
          `Khóa trước quỹ thời gian "${profile.freeTime || "phù hợp nhất"}" vào lịch cố định.`,
          `Bắt đầu bằng một đầu việc nhỏ liên quan trực tiếp đến "${profile.goal || "mục tiêu hiện tại"}".`,
          "Cuối mỗi ngày, ghi lại một bằng chứng tiến bộ để giữ động lực.",
          "Thiết lập bước tự kiểm tra cuối ngày để giữ nhịp đều.",
        ],
    risks: [
      motivation.isLow
        ? `Nếu tiếp tục học/làm theo cảm hứng, trạng thái "${motivationState.toLowerCase()}" sẽ làm kế hoạch đứt nhịp sớm.`
        : "Nếu không có điểm kiểm tra tiến bộ, động lực vẫn có thể giảm sau tuần đầu.",
      `Rào cản "${mainBarrier.toLowerCase()}" có thể tiếp tục kéo trượt lịch nếu không có cách xử lý riêng.`,
      `Thói quen "${mainWeakness.toLowerCase()}" làm giảm xác suất hoàn thành thực tế.`,
      momentum.trend === "đà đang hụt"
        ? "Nếu không dùng dữ liệu nhật ký để giảm tải và chỉnh lịch, các ngày sau sẽ tiếp tục bị trượt."
        : "Nếu bỏ qua dữ liệu nhật ký, kế hoạch các ngày sau sẽ kém sát thực tế hơn.",
    ],
    roadmap: buildAnalysisRoadmap(profile, {
      currentLevel,
      mainBarrier,
      motivationState,
      focusTaskType,
      preferredStyle,
      mainWeakness,
      fourWeekGoal,
      feasibility: realism.feasibility,
      isLowMotivation: motivation.isLow,
      aiSupportMode,
    }),
  };
}

function buildAnalysisRoadmap(profile, context) {
  if (context.isLowMotivation) {
    return [
      {
        week: "Tuần 1",
        goal: "Khôi phục nhịp học/làm và tạo lại cảm giác bắt đầu được",
        focus: [
          `Giảm độ khó khởi động của mục tiêu "${profile.goal || "hiện tại"}".`,
          `Biến "${context.fourWeekGoal}" thành mốc 7 ngày nhỏ hơn.`,
          `Xử lý điểm hụt động lực "${context.motivationState.toLowerCase()}".`,
        ],
      },
      {
        week: "Tuần 2",
        goal: "Tạo chuỗi tiến bộ ngắn hạn đủ nhìn thấy",
        focus: [
          "Mỗi ngày phải có một đầu việc rất nhỏ nhưng hoàn tất được.",
          `Giữ lịch theo kiểu "${context.preferredStyle.toLowerCase()}".`,
          `Giảm tác động của rào cản "${context.mainBarrier.toLowerCase()}".`,
        ],
      },
      {
        week: "Tuần 3",
        goal: "Tăng thời lượng tập trung khi động lực đã ổn hơn",
        focus: [
          `Ưu tiên nhóm việc "${context.focusTaskType.toLowerCase()}".`,
          `Giảm ảnh hưởng của thói quen "${context.mainWeakness.toLowerCase()}".`,
          "Gom các đầu ra nhỏ thành một kết quả nhìn thấy được.",
        ],
      },
      {
        week: "Tuần 4",
        goal: "Củng cố nhịp bền hơn và chốt bước tiếp theo",
        focus: [
          "Đánh giá cách nào giúp giữ lửa tốt nhất.",
          "Giữ lại những task mở máy hiệu quả nhất.",
          "Chốt mục tiêu kế tiếp dựa trên dữ liệu thật thay vì hưng phấn nhất thời.",
        ],
      },
    ];
  }

  const weekOneGoal = context.feasibility === "Rất thấp" || context.feasibility === "Thấp"
    ? `Thu nhỏ mục tiêu "${profile.goal || "hiện tại"}" thành mốc gần hơn`
    : `Ổn định nền tảng để tiến tới mục tiêu "${profile.goal || "hiện tại"}"`;

  return [
    {
      week: "Tuần 1",
      goal: weekOneGoal,
      focus: [
        `Làm rõ hiện trạng ở mức "${context.currentLevel.toLowerCase()}".`,
        `Chốt một đầu ra nhỏ liên quan đến "${context.fourWeekGoal.toLowerCase()}".`,
        `Xếp lịch theo kiểu "${context.preferredStyle.toLowerCase()}".`,
      ],
    },
    {
      week: "Tuần 2",
      goal: "Tạo nhịp làm việc ổn định và xử lý điểm nghẽn chính",
      focus: [
        `Xử lý rào cản "${context.mainBarrier.toLowerCase()}".`,
        `Ưu tiên nhóm việc "${context.focusTaskType.toLowerCase()}".`,
        "Theo dõi tỷ lệ hoàn thành để chỉnh khối lượng cho hợp lý.",
      ],
    },
    {
      week: "Tuần 3",
      goal: "Đẩy đầu ra thực tế và kiểm tra tiến bộ",
      focus: [
        "Hoàn thành một đầu ra nhìn thấy được hoặc đo được.",
        `Giảm tác động của thói quen "${context.mainWeakness.toLowerCase()}".`,
        "Đối chiếu kết quả thật với mục tiêu 4 tuần đã chọn.",
      ],
    },
    {
      week: "Tuần 4",
      goal: "Tổng kết, củng cố và quyết định bước kế tiếp",
      focus: [
        "Giữ lại các khung giờ và cách làm hiệu quả nhất.",
        "Tổng hợp phần đã làm được và phần còn thiếu.",
        "Chốt mục tiêu tiếp theo dựa trên dữ liệu thực tế.",
      ],
    },
  ];
}

function buildSmartPlan(profile, analysis, journal) {
  const goalType = detectGoalType(profile.goal);
  const efficiency = latestEfficiency(journal);
  const motivation = detectMotivationState(profile, state.answers);
  const momentum = analyzeJournalMomentum(journal);
  const goal = profile.goal || "mục tiêu hiện tại";
  const days = [
    { day: "Thứ 2", focus: "Khởi động và vào nhịp" },
    { day: "Thứ 3", focus: "Đào sâu phần cốt lõi" },
    { day: "Thứ 4", focus: "Thực hành và sửa lỗi" },
    { day: "Thứ 5", focus: "Đẩy đầu ra nhìn thấy được" },
    { day: "Thứ 6", focus: "Vá điểm yếu và củng cố" },
    { day: "Thứ 7", focus: "Tổng kết và tối ưu tuần" },
  ];

  const baseByType = {
    study: [
      ["Đọc lại mục tiêu tuần và chọn 1 việc dễ nhất", "10 phút", "high"],
      ["Học một phần cốt lõi ngắn", "45 phút", "high"],
      ["Ghi 3 ý đã hiểu hoặc đã làm xong", "10 phút", "medium"],
    ],
    work: [
      ["Mở lại mục tiêu tuần và chốt 1 việc nhỏ nhất", "10 phút", "high"],
      ["Deep work cho hạng mục chính", "50 phút", "high"],
      ["Ghi lại tiến độ và điểm còn vướng", "10 phút", "medium"],
    ],
    skill: [
      ["Chọn 1 kỹ thuật nhỏ để luyện ngay", "10 phút", "high"],
      ["Thực hành một bài hoặc mini exercise", "50 phút", "high"],
      ["Ghi lại lỗi và điều vừa học được", "10 phút", "medium"],
    ],
  };

  return days.map((day, index) => {
    const tasks = baseByType[goalType].map(([task, time, priority]) => ({
      task,
      time,
      priority,
    }));

    tasks[1] = {
      ...tasks[1],
      task: index >= 3 ? `${tasks[1].task} cho mục tiêu ${goal}` : tasks[1].task,
    };

    if (analysis.feasibility === "Rất thấp" || analysis.feasibility === "Thấp") {
      tasks.unshift({
        task: "Thu nhỏ mục tiêu tuần thành một mốc gần và đo được",
        time: "15 phút",
        priority: "high",
      });
    }

    if (motivation.isLow && index < 4) {
      tasks.unshift({
        task: index % 2 === 0
          ? "Làm phiên mở máy 10 phút để vượt ì"
          : "Viết lại lý do học/làm hôm nay rồi bắt đầu việc nhỏ nhất",
        time: "10 phút",
        priority: "high",
      });
      tasks[tasks.length - 1] = {
        task: index % 2 === 0
          ? "Tự ghi nhận 1 tiến bộ nhỏ sau phiên học/làm"
          : "Chốt lại phần đã xong để giữ cảm giác tiến bộ",
        time: "10 phút",
        priority: "medium",
      };
    }

    if (momentum.trend === "đà đang hụt" && index < 5) {
      tasks.splice(Math.min(1, tasks.length), 0, {
        task: "Chọn một việc chắc chắn hoàn thành để lấy lại đà",
        time: "15 phút",
        priority: "high",
      });
    }

    if (momentum.trend === "đà tiến triển tốt" && index >= 2) {
      tasks.push({
        task: "Đẩy thêm một bước nhỏ để tiến gần mục tiêu tuần",
        time: "20 phút",
        priority: "medium",
      });
    }

    if (efficiency === "Thấp") {
      tasks.push({
        task: "Chừa buffer phục hồi và dọn nợ việc nhẹ",
        time: "15 phút",
        priority: "low",
      });
    }

    return {
      day: day.day,
      focus: motivation.isLow
        ? `${day.focus}. Ưu tiên giữ lửa, tạo cảm giác tiến bộ và không để bị khựng nhịp.`
        : `${day.focus}. Bám đầu ra nhỏ nhưng đo được để nuôi động lực dài hơn.`,
      tasks: tasks.slice(0, 4),
    };
  });
}

function renderPlan() {
  if (!isLoggedIn()) {
    els.planContent.className = "empty-state";
    els.planContent.textContent = "Đăng nhập để tạo kế hoạch tuần cá nhân hóa.";
    return;
  }

  if (!state.plan.length) {
    els.planContent.className = "empty-state";
    els.planContent.textContent = "Chưa có kế hoạch. Hãy hoàn thành hồ sơ, khảo sát và phân tích trước khi tạo lịch tuần.";
    return;
  }

  const motivation = state.analysis?.motivation?.[0] || "Giữ nhịp nhỏ nhưng đều để tiến gần mục tiêu.";
  const momentum = analyzeJournalMomentum(state.journal);

  els.planContent.className = "planner-grid";
  els.planContent.innerHTML = `
    <article class="day-plan">
      <h4>Nhịp động lực</h4>
      <p>${motivation}</p>
      <div class="task-row">
        <div class="task-meta">Giai đoạn 4</div>
        <div>${momentum.note} ${momentum.adjustment}</div>
        <div class="priority medium">Nhịp</div>
      </div>
    </article>
    ${state.plan.map((day) => `
      <article class="day-plan">
        <h4>${day.day}</h4>
        <p>${day.focus}</p>
        <div>
          ${day.tasks.map((task) => `
            <div class="task-row">
              <div class="task-meta">${task.time}</div>
              <div>${task.task}</div>
              <div class="priority ${task.priority}">${priorityLabel(task.priority)}</div>
            </div>
          `).join("")}
        </div>
      </article>
    `).join("")}
  `;
}

function handleJournalSubmit(event) {
  event.preventDefault();
  if (!ensureLoggedIn()) return;

  const entry = {
    day: document.querySelector("#journal-day").value,
    done: document.querySelector("#journal-done").value.trim(),
    status: document.querySelector("#journal-status").value,
    efficiency: document.querySelector("#journal-efficiency").value,
  };

  state.journal = [entry, ...state.journal].slice(0, 14);

  if (state.profile && Object.keys(state.answers).length) {
    state.analysis = generateSmartAnalysis(state.profile, state.answers, state.journal);
    state.plan = buildSmartPlan(state.profile, state.analysis, state.journal);
    setAuthMessage("Đã dùng dữ liệu giai đoạn 4 để cập nhật lại phân tích và điều chỉnh kế hoạch cho các ngày tiếp theo.");
  }

  saveAppState();
  els.journalForm.reset();
  if (els.journalDay) {
    els.journalDay.value = getCurrentWeekdayLabel();
  }
  renderAll();
}

function getFeasibilityTone(feasibility) {
  const value = String(feasibility || "").toLowerCase();
  if (value.includes("rất thấp") || value.includes("rat thap")) {
    return {
      badge: "Cần thu nhỏ mục tiêu",
      line: "Mục tiêu này chưa cần ép nhanh. Thu nhỏ đúng sẽ giúp bạn đi được đường dài hơn.",
    };
  }
  if (value.includes("thấp") || value.includes("thap")) {
    return {
      badge: "Cần đi chắc",
      line: "Bạn vẫn đi tiếp được, nhưng nên lấy lại nhịp bằng các bước nhỏ có thể hoàn thành.",
    };
  }
  if (value.includes("cao")) {
    return {
      badge: "Đà đang tốt",
      line: "Bạn đang có nền khá ổn. Điều quan trọng là giữ được chuỗi tiến bộ đều.",
    };
  }
  return {
    badge: "Có thể tiến lên",
    line: "Bạn chưa cần hoàn hảo. Bạn chỉ cần tiếp tục tiến thêm một đoạn đủ nhỏ mỗi ngày.",
  };
}

function renderAnalysis() {
  if (!isLoggedIn()) {
    els.analysisContent.className = "empty-state";
    els.analysisContent.textContent = "Đăng nhập để nhận phân tích AI và lưu lịch sử theo tài khoản.";
    return;
  }

  if (!state.analysis) {
    els.analysisContent.className = "empty-state";
    els.analysisContent.textContent = "Hoàn thành khảo sát để nhận phân tích về thói quen, động lực và mức độ khả thi.";
    return;
  }

  const tone = getFeasibilityTone(state.analysis.feasibility);
  const motivationItems = (state.analysis.motivation || []).map((item) => `<li>${item}</li>`).join("");
  const roadmapMarkup = (state.analysis.roadmap || []).map((step) => `
    <article class="analysis-block roadmap-block">
      <div class="section-kicker">${step.week}</div>
      <h4>${step.goal}</h4>
      <ul>${(step.focus || []).map((item) => `<li>${item}</li>`).join("")}</ul>
    </article>
  `).join("");

  els.analysisContent.className = "analysis-shell";
  els.analysisContent.innerHTML = `
    <div class="analysis-hero">
      <div class="section-kicker">Bản đồ tiến lên</div>
      <h3 class="section-title">${tone.badge}</h3>
      <p class="section-lead">${state.analysis.summary}</p>
      <div class="analysis-note">${tone.line}</div>
    </div>
    <div class="analysis-grid">
      <article class="analysis-block analysis-block-accent">
        <div class="section-kicker">Giữ lửa</div>
        <h4>Động lực hiện tại</h4>
        <p class="block-note">Không cần chờ cảm hứng lớn. Chỉ cần giữ được lý do đủ rõ để bắt đầu.</p>
        <ul>${motivationItems || "<li>Chưa có dữ liệu động lực cụ thể.</li>"}</ul>
      </article>
      <article class="analysis-block">
        <div class="section-kicker">Điểm tựa</div>
        <h4>Điểm mạnh đang có</h4>
        <ul>${state.analysis.strengths.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article class="analysis-block">
        <div class="section-kicker">Cần chỉnh</div>
        <h4>Điểm cần cải thiện</h4>
        <ul>${state.analysis.improvements.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article class="analysis-block">
        <div class="section-kicker">Nhịp làm việc</div>
        <h4>Thói quen đang chi phối</h4>
        <ul>${state.analysis.habits.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article class="analysis-block">
        <div class="section-kicker">Hành động</div>
        <h4>Việc nên làm ngay</h4>
        <p class="block-note">Ưu tiên các bước đủ nhỏ để tạo cảm giác tiến bộ thật.</p>
        <ul>${(state.analysis.nextActions || []).map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article class="analysis-block">
        <div class="section-kicker">Cảnh báo</div>
        <h4>Rủi ro cần để ý</h4>
        <ul>${(state.analysis.risks || []).map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
    </div>
    <div class="analysis-roadmap">
      ${roadmapMarkup}
    </div>
  `;
}

function renderPlan() {
  if (!isLoggedIn()) {
    els.planContent.className = "empty-state";
    els.planContent.textContent = "Đăng nhập để tạo kế hoạch tuần cá nhân hóa.";
    return;
  }

  if (!state.plan.length) {
    els.planContent.className = "empty-state";
    els.planContent.textContent = "Chưa có kế hoạch. Hãy hoàn thành hồ sơ, khảo sát và phân tích trước khi tạo lịch tuần.";
    return;
  }

  const motivation = state.analysis?.motivation?.[0] || "Giữ nhịp nhỏ nhưng đều để tiến gần mục tiêu.";
  const tone = getFeasibilityTone(state.analysis?.feasibility);
  const momentum = analyzeJournalMomentum(state.journal);

  els.planContent.className = "planner-grid plan-shell";
  els.planContent.innerHTML = `
    <article class="day-plan day-plan-hero">
      <div class="section-kicker">Kế hoạch tuần</div>
      <h4>${tone.badge}</h4>
      <p>${tone.line}</p>
      <div class="plan-hero-note">${motivation}</div>
      <div class="task-row">
        <div class="task-meta">Giai đoạn 4</div>
        <div>${momentum.note} ${momentum.adjustment}</div>
        <div class="priority medium">Nhịp</div>
      </div>
    </article>
    ${state.plan.map((day, index) => `
      <article class="day-plan">
        <div class="section-kicker">Ngày ${index + 1}</div>
        <h4>${day.day}</h4>
        <p>${day.focus}</p>
        <div class="plan-day-promise">Chỉ cần hoàn thành từng task một, bạn sẽ tiến gần mục tiêu hơn hôm qua.</div>
        <div>
          ${day.tasks.map((task) => `
            <div class="task-row">
              <div class="task-meta">${task.time}</div>
              <div>${task.task}</div>
              <div class="priority ${task.priority}">${priorityLabel(task.priority)}</div>
            </div>
          `).join("")}
        </div>
      </article>
    `).join("")}
  `;
}
