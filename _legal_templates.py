def get_legal(r):
    n,f,st = r['name'],r['full'],r['state']
    a,sa = r['areas'],r['sa']
    ap,cp,ra = r['ap'],r['cp'],r['ra']
    ch,sd,tr,tx = r['ch'],r['sd'],r['tr'],r['tx']
    return [
        # 1. 부동산 계약서 핵심 조항 해설
        f"""
### 1. 부동산 계약서 핵심 조항 해설 (Real Estate Contract Key Clauses)

{f}의 평균 주택가격 {ap}에서 안전한 계약을 위해 부동산 계약서(Purchase Agreement)의 핵심 조항을 정확히 이해해야 합니다. 미국 부동산 거래의 대부분은 계약서에 의존하며, 이 문서가 모든 거래 조건을 정의합니다.

#### Contingency(조건부 조항)의 이해
부동산 계약서의 가장 중요한 부분은 contingency입니다. 이는 계약이 성립하기 위한 조건으로, 주로 5가지 종류가 있습니다. 첫째, Home Inspection Contingency(주택검사 조건)는 전문가의 주택 검사를 통해 숨은 결함을 발견할 수 있게 해줍니다. {st}에서는 일반적으로 구매자에게 10-14일의 검사 기간을 제공합니다. 둘째, Appraisal Contingency(감정가 조건)는 은행의 감정가가 제시 가격 이상이어야 계약이 유지된다는 조건입니다. 셋째, Financing Contingency(융자 조건)는 구매자가 필요한 대출금을 얻지 못하면 계약을 취소할 수 있도록 합니다. 넷째, Sale Contingency(판매 조건)는 구매자가 현재 주택을 판매하는 것이 이 계약의 조건이라는 뜻입니다. 다섯째, Clear Title Contingency(명확한 소유권 조건)는 판매자가 깨끗한 소유권(clear title)을 보장해야 한다는 조건입니다.

#### Earnest Money Deposit(계약금)의 역할
Earnest Money는 계약의 진지성을 보여주는 자금으로, 일반적으로 구매 가격의 1-3%입니다. {st}에서 {a[0]} 지역의 평균가격 {ap}이라면, 계약금은 약 수백만 원대입니다. 이 자금은 공인 제3자 에스크로 계정(escrow account)에 보관되며, 거래 완료 시 최종 결제금에 포함됩니다. 만약 구매자가 타당한 이유 없이 계약을 위반하면, 이 자금을 몰수당합니다(forfeiture).

#### Default(계약 위반)와 법적 책임
계약서에서 정의한 조건들을 지키지 않으면 default가 됩니다. 예를 들어, 구매자가 정해진 기일 내에 거래를 완료하지 않거나 필요한 서류를 제출하지 않으면 default입니다. 판매자가 정해진 일정에 소유권을 양도하지 않아도 default입니다. {st} 법에서는 default 이후 일반적으로 3-7일의 cure period(수정 기간)을 제공하여 당사자가 위반을 시정할 기회를 줍니다. 이 기간 내 시정되지 않으면 상대방은 특정이행청구(specific performance), 손해배상청구(damages), 또는 계약 해제(rescission)를 요구할 수 있습니다.

#### 거래 일정(Timeline)과 중요 기한
표준 계약서는 거래 일정을 엄격하게 규정합니다. 계약 서명 후 48시간 이내에 계약금을 에스크로에 입금해야 합니다. Home inspection period는 보통 7-14일이며, appraisal은 10-21일 소요됩니다. Title Search는 7-10일이 필요하고, 최종 walkthrough는 거래 완료 2-3일 전에 진행됩니다. 모든 contingency는 정해진 기한 내에 처리되지 않으면 자동으로 waive(포기)됩니다.

#### Disclosure(공시)의 의무와 책임
판매자는 주택의 알려진 모든 결함을 Seller's Disclosure Statement를 통해 공시해야 합니다. 이는 법적 의무로, {st}에서는 계약 체결 전 또는 매우 짧은 기간 내에 제시되어야 합니다. 숨겨진 결함(hidden defect)은 나중에 발견되면 판매자의 법적 책임이 될 수 있습니다. 예를 들어, 지붕의 누수, 기초의 균열, 해충 문제 등은 반드시 공시해야 합니다. 고의적으로 공시를 회피하면 fraudulent misrepresentation으로 소송당할 수 있습니다.

#### 에스크로(Escrow)의 역할과 보호
에스크로는 중립적 제3자로, 구매자의 계약금과 판매자의 소유권 증서를 모두 보관하면서 모든 계약 조건이 완료될 때까지 자금을 동결합니다. 계약서의 모든 contingency가 만족되고, 최종 결제금이 준비되어야만 에스크로 담당자가 자금을 이체합니다. 이 시스템은 양쪽 당사자를 보호하며, {st}의 모든 주택 거래는 에스크로를 통해 진행됩니다. 에스크로 기간 동안 구매자는 주택에 대한 insurance와 property tax 책임을 지지 않습니다.

#### 표준 계약서 수정과 주의사항
계약서는 표준 양식이지만 당사자 간 협상을 통해 수정할 수 있습니다. 그러나 모든 수정사항은 명확하게 서면으로 기록되어야 하며, 양쪽이 초기를 해야 합니다. 일부 초보 구매자는 판매자의 제안을 무조건 받아들이거나, 변호사 검토 없이 계약서에 서명하는 실수를 합니다. {st}에서는 계약서 검토 기간(attorney review period)을 요청할 수 있으며, 이 기간 동안 변호사의 조언을 받을 수 있습니다. 계약서의 모든 조항은 법적 구속력을 가지므로, 서명 전 충분한 시간을 가지고 검토해야 합니다.

""",
        # 2. 세입자 권리와 임대차 보호법
        f"""
### 2. 세입자 권리와 임대차 보호법 (Tenant Rights and Lease Protection)

{f}에서 임차인(tenant)으로 생활할 때 알아야 할 권리와 의무가 있습니다. 미국의 임대차법(landlord-tenant law)은 주(state)와 지역(municipality)에 따라 다르지만, 연방 차원의 기본 원칙들이 적용됩니다.

#### Fair Housing(공정한 주택 제공) 원칙
Fair Housing Act는 1968년 제정되어 인종, 피부색, 종교, 성별, 국적(national origin), 장애(disability), 또는 가족 상태에 따른 차별을 금지합니다. {st}에서 임차인이 이러한 이유로 거절당하거나 차별받으면 법적 구제를 청구할 수 있습니다. 예를 들어, 임대인이 특정 국적의 사람을 받지 않거나, 장애인을 거절하는 행위는 직접적인 위반입니다. 차별 신고는 HUD(Department of Housing and Urban Development)에 할 수 있으며, 조사 후 위반이 확인되면 임대인은 벌금을 내고 손해배상을 지급할 수 있습니다.

#### Security Deposit(보증금)의 규정과 보호
보증금은 임차인이 임차 주택에 손상을 입히거나 임대료를 내지 않을 경우에 대비하기 위해 임대인에게 내는 자금입니다. {st}의 법에서는 보증금의 최대 금액을 규정하고 있으며, 일반적으로 월세의 1-2개월분입니다. {ra}에서 월세가 얼마라면 보증금은 그에 따라 결정됩니다. 임대인은 보증금을 분리된 이자 생성 계정(interest-bearing account)에 보관해야 하며, 많은 주에서는 임대인이 이자를 임차인에게 돌려줄 것을 요구합니다. 임차 관계가 종료되면, 임대인은 30-45일 이내에 보증금을 반환하거나 명확한 정당한 사유(itemized deductions)를 제시하면서 일부 공제한 금액을 반환해야 합니다.

#### Eviction(퇴거) 절차와 임차인 보호
임대인이 임차인을 강제로 퇴거시키려면 정해진 법적 절차를 따라야 합니다. 먼저 임대인은 종료 통지(notice to quit)를 임차인에게 제공해야 하며, {st}에서는 일반적으로 30-60일의 통지 기간을 요구합니다. 임차인이 통지 기간 내에 이사 가지 않으면 임대인은 법원에 quistclaim 소송을 제기할 수 있습니다. 법원에서 판사가 결정을 내리기 전까지 임차인은 주택에 거주할 권리가 있습니다. 만약 임차인이 소송에서 졌다면, 판사는 eviction order(퇴거 명령)를 내리고, 이를 실행하기 위해 경찰이 개입할 수 있습니다. 그러나 {st}에서는 임대인이 정당한 사유(just cause) 없이 임차인을 퇴거시킬 수 없으며, 정당한 사유는 대부분 임대료 미납, 계약 위반, 불법 행위, 또는 주택 재개발입니다.

#### Habitability Standard(거주 적합성 기준)
모든 임대 주택은 habitability standard를 충족해야 합니다. 이는 주택이 안전하고, 기본적인 설비(욕실, 주방, 난방, 냉방, 전기)를 갖추고, 생활이 가능한 상태여야 한다는 뜻입니다. 만약 임대인이 심각한 결함을 수리하지 않으면, 임차인은 rent withholding(임대료 보류), repair and deduct(수리 후 임대료에서 공제), 또는 lease termination(계약 해제)의 방법으로 대응할 수 있습니다. 예를 들어, 난방 시스템이 겨울에 작동하지 않거나, 지붕이 새는 경우는 명백한 habitability 위반입니다.

#### Rent Control(임대료 통제)와 Rent Increase(임대료 인상) 제한
일부 주와 지역, 특히 캘리포니아와 뉴욕에서는 rent control을 시행합니다. {st}에서 rent control이 있다면, 임대인이 임차인의 임대료를 무제한 올릴 수 없습니다. 일반적으로 인상은 연 1회로 제한되며, 인상 폭도 주 또는 지역의 inflation rate 또는 특정 퍼센트로 제한됩니다. 임대인이 임대료를 인상하려면 보통 30-60일 전에 서면 통지를 해야 합니다. 만약 인상이 법을 위반하면 임차인은 임대료 인상을 거부할 수 있으며, 임대인의 보복적 퇴거 위협에도 대항할 수 있습니다.

#### Retaliation(보복) 금지
임대인이 임차인의 정당한 행동에 대해 보복할 수 없습니다. 정당한 행동은 주택 결함을 신고하고, 공정한 주택 조건을 요구하고, 임차인 조합(tenant union)에 참여하는 것 등입니다. 만약 임차인이 이러한 행동 후 30일 이내에 임대료 인상, 퇴거 통지, 또는 서비스 감소를 당하면, 법적으로 보복으로 간주됩니다. 임차인은 이를 법원에 증명하여 임대인의 조치를 무효화할 수 있습니다.

#### 임대 계약서(Lease Agreement) 작성과 검토
임대 계약서는 임차인과 임대인 모두를 보호하는 법적 문서입니다. 계약서에는 월임대료, 임차 시작 및 종료 날짜, 보증금, 반려동물 정책, 이사 통지 기한, 수리 책임, 그리고 기타 조건들이 포함되어야 합니다. {st}의 표준 계약서 양식이 있으나, 양쪽 당사자가 조건을 협상하고 수정할 수 있습니다. 임차인은 서명 전에 변호사의 검토를 받거나, 적어도 모든 조항을 명확히 이해해야 합니다. 특히 "주민 재산은 임대인의 책임이 아니다"라는 면책 조항은 많은 주에서 강제할 수 없습니다.

#### 임차인의 의무와 책임
임차인도 계약서의 조건을 따를 의무가 있습니다. 이는 월임대료를 정해진 날짜에 내고, 주택을 합리적으로 관리하고(reasonable care), 임대인과 다른 주민에게 피해를 주지 않는 것입니다. 과도한 소음, 불법 활동, 주택에 대한 의도적 손상은 임차인의 위반입니다. 임차인이 계약을 위반하면 임대인은 notice to cure를 발급할 수 있으며, 임차인이 지정된 기간 내에 위반을 시정하지 않으면 퇴거 절차를 시작할 수 있습니다.

""",
        # 3. 재산세 이의신청과 절세 전략
        f"""
### 3. 재산세 이의신청과 절세 전략 (Property Tax Appeal and Tax Savings)

{f}에서 주택을 소유하면 연간 property tax(재산세)를 내야 합니다. {st}의 평균 주택가격이 {ap}이고 재산세율이 {tx}라면, 상당한 세금 부담이 발생합니다. 그러나 합법적인 방법으로 재산세를 낮출 수 있습니다.

#### Property Tax Assessment(재산세 평가)와 기준
재산세는 지방 정부(county assessor)가 주택의 assessed value에 따라 계산합니다. Assessed value는 시장 가치(market value)와 다를 수 있습니다. {st}에서 법적으로 인정된 assessment ratio(평가 비율)가 있으며, 예를 들어 50%라면 시장 가치의 50%만 과세 대상입니다. 평가액은 주택의 위치, 크기, 상태, 나이, 그리고 최근 유사 주택의 판매가에 따라 결정됩니다. 지역 assessor office에서는 공개적으로 모든 주택의 평가액과 판매 가격 등의 정보를 제공합니다.

#### Property Tax Appeal(재산세 이의신청) 절차
만약 평가액이 불공정하다고 생각하면, 법적으로 이의를 제기할 수 있습니다. {st}에서는 일반적으로 평가 공시 후 30-60일 이내에 Board of Assessment Appeals에 이의 신청서(appeal form)를 제출해야 합니다. 이의 신청 시 현재 평가액이 시장 가치보다 높다는 증거를 제시해야 합니다. 증거는 다음과 같습니다: (1) 최근 판매된 유사 주택의 가격(comparable sales), (2) 독립적인 주택 감정가 평가(appraisal), (3) 주택의 상태, 결함, 또는 특수한 상황을 나타내는 사진이나 보고서. 예를 들어, {a[0]} 지역의 유사한 크기와 조건의 주택들이 {ap} 범위에서 팔렸는데, 당신의 주택이 훨씬 높게 평가되었다면 이의 신청의 근거가 됩니다.

#### 감정가(Appraisal)의 역할과 활용
전문 주택 감정사(licensed appraiser)의 감정가는 재산세 이의 신청의 가장 강력한 증거입니다. 감정가는 주택의 모든 특징을 조사하고 최근 유사 판매 사례를 분석하여 공정한 시장 가치를 제시합니다. {st}에서 감정가는 일반적으로 $400-700의 비용이 들며, 이의 신청을 통해 재산세를 충분히 낮출 수 있다면 투자할 가치가 있습니다. 예를 들어, $500의 감정가로 연간 재산세를 $2,000 절감할 수 있다면, 몇 년 내 비용을 회수할 수 있습니다.

#### Comparable Sales(유사 판매) 조사
Assessment appeals board는 최근 판매된 유사 주택들의 가격을 매우 중시합니다. 유사 주택이란 다음 기준을 충족하는 것입니다: (1) 같은 동네 또는 유사한 동네, (2) 유사한 크기(square footage), (3) 유사한 나이와 상태, (4) 유사한 편의시설(garage, pool 등), (5) 최근 1-2년 내 판매된 것. {f}에서 비슷한 조건의 주택들이 {ap}에서 판매되었다면, 당신의 평가액이 이보다 높으면 이의 신청의 근거가 됩니다. Public records(재산 기록)에서 이 정보를 찾을 수 있으며, 많은 온라인 사이트(Zillow, Redfin, 지역 MLS)에서도 확인할 수 있습니다.

#### Board of Assessment Appeals(평가위원회) 청문회
이의 신청이 접수되면 county는 청문회 날짜를 통지합니다. 청문회에서 재산 소유자는 자신의 주장과 증거를 제시할 수 있습니다. 청문회에서 효과적으로 주장하려면: (1) 평가액이 공공 기록상 유사 주택의 가격과 비교되어 너무 높은 이유, (2) 주택의 특수한 결함 또는 상황(예: 고속도로 근처로 인한 소음, 습도 문제), (3) 지역 시장의 최근 변화. {st}의 청문회는 형식적이지 않으며, 법적 대리인 없이도 참석할 수 있습니다. 그러나 복잡한 경우에는 tax attorney나 tax consultant의 도움을 받는 것이 효과적입니다.

#### Homestead Exemption(주거지 감면)
많은 주에서 homestead exemption을 제공하여 주 거주 주택의 평가액을 일부 감면합니다. {st}에서 이를 제공한다면, 등록 절차를 통해 평가액의 $10,000-50,000 정도를 면제받을 수 있습니다. 이는 담당 assessor office에 homestead exemption 신청서를 제출하면 됩니다. 조건은 일반적으로 (1) 주택이 주 거주지(primary residence), (2) 주 거주 기간이 일정 기간 이상(예: 6개월 이상)입니다.

#### 기타 Tax Exemptions(세금 감면)
노인(65세 이상), 장애인, 전쟁 참전자 등은 추가적인 tax exemptions을 받을 수 있습니다. {st}에서 이러한 범주에 해당하면 자격 확인을 위해 assessor office에 서류를 제출하면 됩니다. 또한 특정 주택 개선(에너지 효율 개선, 태양광 설치 등)에 대한 tax credit도 있습니다. 예를 들어, 에너지 효율을 개선하는 태양광 패널 설치는 연방과 주 차원의 tax credit을 받을 수 있습니다.

#### 재산세 납부 방법과 기한
재산세는 일반적으로 연 1-4회로 나누어 납부합니다. 납부 기한을 놓치면 penalty와 interest가 부과됩니다. {st}에서는 6개월 이상 미납하면 이자와 penalty가 누적되어 원래 세금보다 훨씬 많아질 수 있습니다. 모기지가 있다면, 대출 기관이 escrow account에서 연간 재산세를 미리 예치(estimate)하고 자동으로 납부합니다. 만약 이의 신청이 성공하여 평가액이 낮아지면, 다음 세금 산정부터 반영됩니다.

#### 비용-편익 분석
재산세 이의 신청에는 시간과 비용이 들 수 있습니다. Appraiser 비용($400-700), 변호사 상담비(시간당 $150-300), 그리고 시간 투자 등을 고려해야 합니다. 그러나 {ap}의 가격대에서 {tx}의 세율이라면, 평가액을 $50,000 낮추는 것만으로 연간 세금을 크게 절감할 수 있습니다. 예를 들어, 세율이 1.5%라면, $50,000 감소는 연 $750의 절감이며, 이는 몇 년 내 모든 비용을 회수하고도 남습니다.

""",
        # 4. 주택 소유권 형태와 법적 효과
        f"""
### 4. 주택 소유권 형태와 법적 효과 (Property Ownership Types and Legal Effects)

{f}에서 주택을 구매할 때 ownership structure(소유권 형태)를 선택해야 합니다. 이 선택은 세금, 상속, 책임(liability), 그리고 향후의 법적 문제에 영향을 미칩니다.

#### Sole Ownership(단독 소유)
Sole ownership은 한 명이 주택을 완전히 소유하는 형태입니다. 소유자는 주택에 대한 모든 권리와 책임을 가집니다. 소유권은 deed에 한 사람의 이름으로 기록되며, 상속 시에는 probate 절차를 거쳐야 합니다. {st}에서 sole ownership은 가장 간단한 형태이지만, 주택이 소유자의 개인 자산이므로 소송 시 채권자(creditor)가 주택을 압류할 수 있습니다. 예를 들어, 주택 소유자가 큰 의료비 채무나 판결금을 지지 못하면, 채권자는 주택을 압류하여 경매할 수 있습니다(foreclosure by judgment lien).

#### Joint Tenancy(공동 소유)
Joint Tenancy는 두 명 이상이 주택을 공동으로 소유하는 형태입니다. 이 형태의 핵심 특징은 Right of Survivorship(생존자 귀속권)입니다. 한 공동 소유자가 사망하면, 그의 지분은 자동으로 생존한 공동 소유자에게 귀속됩니다. 유언(will)에 관계없이 자동으로 이전되므로, probate를 거치지 않습니다. {st}에서 부부가 함께 주택을 구매할 때 joint tenancy를 선택하면, 한 명이 사망할 때 자동으로 생존 배우자가 소유하게 됩니다. 그러나 joint tenancy는 모든 공동 소유자가 동등한 지분을 가져야 하며, 한 공동 소유자가 일방적으로 자신의 지분을 판매하면 joint tenancy가 해제되고 tenancy in common으로 변환됩니다.

#### Tenancy in Common (TIC, 공유지분)
TIC는 두 명 이상이 주택을 공동으로 소유하지만, 지분의 크기가 다를 수 있는 형태입니다. 예를 들어, A가 60% 소유하고 B가 40% 소유할 수 있습니다. Survivorship이 없으므로, 한 공동 소유자가 사망하면 그의 지분은 상속인(heir)이나 유언의 수혜자에게 넘어갑니다. 각 공동 소유자는 자신의 지분을 자유롭게 판매하거나 양도할 수 있습니다. {f}에서 여러 명이 투자 목적으로 주택을 구매할 때 TIC를 사용하면, 각자의 투자 비율을 명확히 할 수 있습니다. 그러나 TIC는 분쟁의 가능성이 높습니다. 한 공동 소유자가 이사하거나, 팔고 싶어 하거나, 주택 개선에 투자하고 싶을 때 다른 공동 소유자와 의견이 충돌할 수 있습니다.

#### Tenancy by the Entirety(부부 공동 소유)
일부 주에서는 tenancy by the entirety를 인정하는데, 이는 법적으로 결혼한 부부만 사용할 수 있는 형태입니다. 이 형태는 joint tenancy와 유사하지만, 더 강한 survivorship 보호를 제공합니다. 부부 중 한 명이 사망하면 생존 배우자가 자동으로 전체 소유권을 가집니다. 또한 개별 배우자의 채권자는 배우자 동의 없이 주택을 압류할 수 없습니다. {st}에서 tenancy by the entirety를 인정한다면, 부부가 함께 구매할 때 매우 유리할 수 있습니다.

#### Trust(신탁)를 통한 소유
Trust는 법적 실체(legal entity)로, 신탁자(trustor)가 자산을 신탁에 넣고 수탁자(trustee)가 수혜자(beneficiary)를 위해 관리하는 구조입니다. Living trust(생전 신탁)는 신탁자가 살아있을 때 설립되며, 신탁자 자신이 수탁자가 될 수 있습니다. 주택을 living trust에 넣으면, 신탁자가 사망할 때 probate를 거치지 않고 지정된 수혜자에게 자동으로 넘어갑니다. {st}에서 probate는 복잡하고 비용이 많이 드는 절차이므로, living trust는 probate 회피의 좋은 방법입니다. 또한 trust를 통한 소유는 개인 정보 보호(privacy protection)도 제공합니다. deed에 개인 이름 대신 trust 이름이 기록되므로, 공개 기록에서 개인의 재산 정보가 드러나지 않습니다.

#### LLC(Limited Liability Company)를 통한 소유
LLC는 사업 구조로, 주택을 LLC 명의로 소유할 수 있습니다. LLC 소유의 주요 장점은 liability protection(책임 보호)입니다. 주택에서 누군가 다치거나 손해를 입으면, 소송은 LLC를 대상으로 진행되며, 개인 자산이 보호됩니다. 예를 들어, 방문객이 주택의 결함으로 인해 다치면, 개인 소유라면 개인의 모든 자산이 위험에 빠질 수 있습니다. 하지만 LLC 소유라면, 소송은 LLC 자산으로만 제한될 수 있습니다. 그러나 LLC 소유에는 단점도 있습니다. (1) 설립 및 유지 비용이 든다. (2) 대출 기관이 LLC 소유의 주택에 mortgage를 주는 것을 꺼릴 수 있다. (3) 세금 보고가 더 복잡하다. (4) 어떤 주에서는 특정 목적으로의 LLC 사용을 제한한다.

#### 소유권 형태 선택 시 고려사항
소유권 형태를 선택할 때는 다음 사항을 고려해야 합니다. (1) 상속 계획: probate를 피하고 싶다면 joint tenancy나 living trust가 좋다. (2) 세금: 세금 효과는 ownership structure에 따라 다르며, CPA의 조언이 필요하다. (3) liability 보호: lawsuit으로부터 보호받고 싶다면 LLC나 trust가 효과적이다. (4) 대출: 대출 기관의 요구사항에 따라 ownership structure가 결정될 수 있다. {f}에서 주택을 구매하려면, 변호사와 CPA의 상담을 통해 최적의 ownership structure를 결정해야 합니다.

#### Deed와 Title의 중요성
주택 소유권은 deed(증서)를 통해 입증됩니다. Deed는 이전 소유자(grantor)가 현재 소유자(grantee)에게 주택 소유권을 이전하는 법적 문서입니다. {st}의 county recording office에 deed를 기록(record)함으로써 소유권이 공식적으로 등록됩니다. Title(소유권)은 주택을 소유할 법적 권리이며, 이를 증명하기 위해 title insurance가 있습니다. Title insurance는 이전 소유권자의 미해결 청구(unsettled claim)나 오류로부터 현재 소유자를 보호합니다.

""",
        # 5. 이웃 분쟁과 법적 해결
        f"""
### 5. 이웃 분쟁과 법적 해결 (Neighbor Disputes and Legal Remedies)

{f}에서 주택을 소유하면서 이웃과의 분쟁이 발생할 수 있습니다. 부동산 분쟁(real property disputes)은 복잡할 수 있지만, 법적 절차가 명확하게 정의되어 있습니다.

#### Boundary Disputes(경계 분쟁)
경계 분쟁은 인접한 두 주택의 경계선에 대한 불합의입니다. {a[0]} 지역에서 오래된 주택들은 original survey(원본 측량)가 명확하지 않을 수 있으며, 이로 인해 분쟁이 발생합니다. 경계를 명확히 하려면 licensed surveyor(공인 측량사)에게 의뢰하여 새로운 survey를 진행합니다. Survey는 일반적으로 $300-800이 소요되며, 이를 통해 명확한 경계선을 지도로 표시합니다. 만약 이웃이 원본 survey와 다른 사실을 주장하면, 법원에 경계 확정 소송(boundary line action)을 제기할 수 있습니다. 법원은 증거(deed, 역사적 기록, 점유)를 검토하여 경계를 결정합니다.

#### Adverse Possession(점유에 의한 취득)
Adverse possession은 장기간 다른 사람의 토지를 점유하면 법적으로 그 토지의 소유자가 될 수 있는 법칙입니다. {st}에서는 일반적으로 7-20년의 점유 기간이 필요합니다(주마다 다름). 이 점유는 다음 조건을 충족해야 합니다: (1) Open and notorious(공개적이고 명백함): 이웃이 알 수 있을 정도로 공개되어야 함. (2) Exclusive(배타적): 점유자 외 다른 사람의 사용을 배제함. (3) Actual(실제적): 실제로 그 토지를 사용하거나 점유함. (4) Hostile(적대적): 진정한 소유자의 동의 없음. (5) Continuous(계속적): 중단 없이 필요한 기간 동안 지속. 예를 들어, 이웃이 당신의 토지의 일부에 울타리를 만들고 그곳에 정원을 가꾸기를 20년 동안 계속하면, 법원이 그 이웃에게 이 부분의 소유권을 인정할 수 있습니다. 이를 방지하려면 이웃이 당신의 토지를 무단 사용하지 못하도록 하거나, 서면 허가를 주어 adverse possession의 조건을 깨뜨려야 합니다.

#### Tree Disputes(나무 관련 분쟁)
나무 뿌리가 이웃의 토지로 침입하거나, 나뭇가지가 이웃의 재산에 자라 나가면 분쟁이 발생할 수 있습니다. {st}의 법은 일반적으로 "나무는 그 뿌리가 있는 토지의 소유자에게 속한다"는 원칙을 따릅니다. 그러나 나뭇가지가 이웃의 재산에 침범하면, 이웃은 그 가지를 자를 권리가 있습니다. 나무로 인한 손해(예: 떨어진 열매, 낙엽 정리, 뿌리로 인한 하수도 손상)는 일반적으로 natural event로 간주되어 소유자의 책임이 아닙니다. 그러나 나무가 위험한 상태(dead tree, 불안정한 형태)인 줄 알면서 수리하지 않아 손해가 발생하면, 소유자의 책임이 될 수 있습니다.

#### Nuisance(방해)와 Unreasonable Use
Nuisance는 이웃의 재산 사용 또는 향유를 불합리하게 방해하는 행위입니다. 이는 Private Nuisance와 Public Nuisance로 구분됩니다. Private Nuisance는 특정 이웃에게 피해를 주는 것으로, 예를 들어 극도의 소음, 악취, 연기, 또는 지나친 물 사용으로 이웃의 우물을 마르게 하는 것입니다. Public Nuisance는 공중 일반에게 영향을 미치는 것으로, 지역 정부가 대응하는 경우가 많습니다. Nuisance의 판단은 합리성 기준에 따릅니다. 예를 들어, 주중 오전 9시부터 오후 5시까지 수리 소음은 일반적으로 합리적이지만, 밤 11시에 시끄러운 파티를 열면 nuisance가 될 수 있습니다. 피해를 입은 이웃은 소송을 통해 피해를 멈추거나(abatement), 손해배상(damages)을 청구할 수 있습니다.

#### Easement(지역권)와 Right of Way
Easement는 다른 사람이 당신의 토지를 특정 목적으로 사용할 권리입니다. 예를 들어, 이웃이 당신의 토지를 지나서 뒷길에 접근하는 right of way를 가질 수 있습니다. Easement는 deed에 기록되며, 이후의 모든 소유자에게도 적용됩니다. {st}에서는 다음과 같은 공통 easement가 있습니다: (1) Utility easement: 전력선, 수도, 가스 회사가 유틸리티를 유지하기 위해 사용. (2) Access easement: 다른 토지 소유자의 접근 권리. (3) Drainage easement: 빗물이나 오수를 흐르게 할 권리. Easement 위반은 소송 대상이 될 수 있으며, 침해자는 금지 명령(injunction)을 받을 수 있습니다.

#### HOA(Homeowners Association) Disputes
분양 주택이나 타운홈의 경우, HOA의 규칙(CC&Rs - Covenants, Conditions & Restrictions)을 따라야 합니다. HOA는 공동 구역을 관리하고, 주택 유지 기준을 강제합니다. {f}의 HOA가 특정 색의 페인트, 울타리의 높이, 잔디 관리 등의 규칙을 정합니다. HOA가 규칙을 위반한다고 생각하면 fine(벌금)을 부과할 수 있습니다. 주택 소유자가 이의를 제기할 수 있으며, HOA 총회에서 표결을 통해 결정됩니다. 심각한 경우 HOA를 상대로 소송을 제기할 수 있습니다.

#### 분쟁 해결의 단계
부동산 분쟁을 해결하는 단계는 다음과 같습니다. (1) Informal negotiation: 이웃과 직접 대화하여 해결 시도. (2) Mediation: 중립적 제3자가 양쪽 입장을 조정. {st}의 많은 지역에서 무료 또는 저비용 mediation 서비스를 제공합니다. (3) Demand letter: 변호사가 작성한 공식 요청 편지로, 상대방에게 마지막 해결 기회 제공. (4) Litigation: 소송 제기. 부동산 소송은 district court에서 진행되며, 판사가 판결을 내립니다.

#### 변호사 선임과 비용
부동산 분쟁에서 변호사의 도움은 중요합니다. 변호사는 당신의 법적 권리를 보호하고, 상대방과의 협상을 주도합니다. {st}에서 부동산 변호사의 시간당 비용은 $150-400이며, 분쟁의 복잡성에 따라 전체 비용은 $2,000-10,000 이상일 수 있습니다. 그러나 초기 상담은 무료인 경우가 많으므로, 분쟁이 발생하면 즉시 변호사의 조언을 받는 것이 좋습니다.

""",
        # 6. 주택 보험 완벽 가이드
        f"""
### 6. 주택 보험 완벽 가이드 (Homeowner's Insurance Guide)

{f}에서 주택을 소유하면 homeowner's insurance(주택 소유자 보험)는 법적 의무는 아니지만, mortgage를 받았다면 대출 기관이 필수로 요구합니다. 주택 보험은 화재, 도난, 폭풍, 그리고 기타 위험으로부터 주택과 개인 재산을 보호합니다.

#### 주택 보험의 기본 구조
주택 보험의 기본 정책(HO-3, 가장 일반적)은 여러 부분으로 구성됩니다. (1) Dwelling coverage: 주택 건물 자체의 손상을 보장합니다. (2) Other structures: 별도의 차고, 헛간 등의 구조물을 보장합니다(일반적으로 dwelling의 10%). (3) Personal property: 가구, 의류, 전자제품 등 집의 물품을 보장합니다(일반적으로 dwelling의 50-70%). (4) Liability coverage: 타인이 당신의 주택에서 다치거나 손상이 생겼을 때의 법적 책임을 보장합니다(일반적으로 $100,000-300,000). (5) Medical payments: 당신의 주택에서 다치거나 병이 난 타인의 의료비를 보장합니다(일반적으로 $1,000-5,000).

#### Dwelling Coverage(건물 보장)의 금액 결정
Dwelling coverage 금액은 주택의 재건축 비용(reconstruction cost)을 기반으로 결정됩니다. {f}의 평균 주택가격이 {ap}라 해도, 재건축 비용은 건축 비용(construction cost)과 노동비(labor cost)를 포함하므로 다를 수 있습니다. {st}에서 square foot당 평균 건축 비용을 알아야 합니다. 예를 들어, 주택이 2,000 square feet이고 square foot당 재건축 비용이 $200이라면, 필요한 dwelling coverage는 $400,000입니다. 충분하지 않은 coverage를 선택하면, 손상 발생 시 보험이 전체 비용을 커버하지 못합니다. 많은 주택 소유자들이 주택 가격으로 coverage를 결정하는데, 이는 잘못된 접근입니다. 대신 재건축 비용 추정(reconstruction cost estimate)을 보험사에 요청해야 합니다.

#### Deductible(공제액)과 Premium(보험료)
Deductible은 손해 발생 시 보험 청구 전에 주택 소유자가 직접 부담하는 금액입니다. {st}에서는 일반적으로 $500-1,000이 기본이며, $2,500이나 $5,000을 선택할 수도 있습니다. Deductible이 높을수록 월 보험료(premium)가 낮아집니다. 반대로 낮은 deductible은 높은 premium을 의미합니다. Premium은 또한 다음 요소에 영향을 받습니다: (1) 주택의 나이와 상태. (2) 건축 재료(벽돌/목재). (3) 지붕의 나이(15년 이상이면 premium이 높아질 수 있음). (4) 거주 지역의 위험도(crime rate, fire hazard). (5) 보험 회사의 청구 이력. (6) 안전 장치(smoke detector, alarm system).

#### Exclusion(보장 제외)과 Limitation(보장 한계)
모든 주택 보험에는 보장하지 않는 위험(exclusion)과 보장의 한계(limitation)가 있습니다. 일반적인 제외는: (1) Flooding: 홍수는 별도의 flood insurance가 필요합니다. (2) Earthquakes: 지진 보장은 별도로 추가해야 합니다. (3) Wear and tear: 나이로 인한 손상은 보장하지 않습니다. (4) Neglect: 관리 부족으로 인한 손상은 보장하지 않습니다. (5) War: 전쟁으로 인한 손상은 보장하지 않습니다. 또한 개인 재산(personal property)의 특정 항목(jewels, artwork, expensive items)은 coverage 한계가 있습니다(예: 보석은 $2,500 한계). 비싼 물품을 보장받으려면 rider(특약)을 추가해야 합니다.

#### Flood Insurance(홍수 보험)의 중요성
Flood insurance는 주택 보험에 포함되지 않으며, 별도로 구입해야 합니다. {f}가 홍수 위험 지역(flood zone)에 있다면 매우 중요합니다. National Flood Insurance Program (NFIP)은 연방 홍수 보험을 제공하며, 일부 개인 보험사도 홍수 보험을 제공합니다. Flood insurance는 높은 비용(연간 $400-1,500 이상)이 들 수 있지만, 홍수는 매우 파괴적이므로 보장 받는 것이 필수입니다. 홍수 위험 지역에 주택이 있고 mortgage가 있다면, 대출 기관이 홍수 보험을 의무화할 수 있습니다.

#### Earthquake Insurance(지진 보험)
{st}에서 지진 위험이 있다면(특히 캘리포니아), earthquake insurance를 고려해야 합니다. 일반 주택 보험은 지진으로 인한 손상을 보장하지 않습니다. Earthquake insurance는 높은 deductible(일반적으로 15-25% of coverage)이 특징입니다. 이는 premium을 낮추기 위함입니다. 지진 보험은 expensive하지만, 지진 위험 지역에서는 필수입니다.

#### Insurance Claim(보험 청구) 절차
주택이 손상되면 즉시 보험사에 신고하고 claim을 청구합니다. (1) 손상 사진 촬영: 가능한 모든 각도에서 손상을 촬영합니다. (2) Claim form 작성: 보험사가 form을 제공하거나 온라인으로 청구할 수 있습니다. (3) Adjuster 방문: 보험사의 adjuster(사정인)가 손상을 조사합니다. (4) Estimate 제출: 수리 업체의 estimate를 보험사에 제출합니다. (5) Payment: 보험사가 deductible을 제외한 금액을 지급합니다. Claim 처리는 일반적으로 2-4주 소요됩니다.

#### Premium 절감 방법
주택 보험료를 절감할 수 있는 방법들: (1) Bundling: 자동차 보험과 함께 구입하면 할인(일반적으로 10-25%). (2) Home improvements: 지붕, 창문, 난방 시스템 업그레이드는 할인을 받을 수 있습니다. (3) Safety devices: smoke detector, alarm system 설치는 할인을 받습니다. (4) Claim-free discount: 일정 기간 claim을 청구하지 않으면 할인을 받습니다. (5) Good credit: 좋은 credit score는 낮은 premium을 의미합니다. (6) Paying in full: 월 납부보다 연 납부가 더 저렴합니다.

#### Policy Review(정책 검토)와 업데이트
연간 정책을 검토하여 충분한 coverage가 있는지 확인해야 합니다. 주택을 개선했거나(예: 추가 방 건설), 비싼 물품을 구입했다면 coverage를 증가시켜야 합니다. 또한 매년 여러 보험사의 견적을 비교하는 것이 좋습니다. {st}에서는 보험료 경쟁이 치열하므로, 보험사를 바꾸면 significant savings를 얻을 수 있습니다.

""",
        # 7. 상속과 부동산 - 프로베이트 절차
        f"""
### 7. 상속과 부동산 - 프로베이트 절차 (Inheritance, Real Estate, and Probate)

주택이 {f}에 있을 때, 소유자가 사망하면 주택의 처분과 상속은 복잡한 법적 절차를 거칩니다. {st}의 probate 법은 다른 주와 다를 수 있으므로, 상속 계획(estate planning)을 미리 하는 것이 중요합니다.

#### Probate(프로베이트) 절차의 개요
Probate는 사망자의 유산(estate)을 처리하는 법원 감시 절차입니다. 사망자가 유언(will)을 남겼다면, 유언 검증(probate)을 통해 유언의 유효성을 확인하고 유산을 배분합니다. Probate가 없다면 intestate succession(법정 상속)이 적용되어 주 법에 따라 상속인을 결정합니다. {st}에서는 일반적으로 배우자가 우선 상속인이고, 배우자가 없으면 자녀, 그 다음 부모 등으로 정해집니다.

#### Will(유언)의 작성과 법적 요구사항
Will은 사망 후 재산을 어떻게 분배할지를 정하는 법적 문서입니다. {st}에서 유효한 will이 되려면: (1) 성인(18세 이상)이어야 함. (2) 정신적으로 유능해야 함(sound mind). (3) 자필 또는 타이핑으로 작성. (4) 서명. (5) 2-3명의 증인(witness) 서명. Will을 만들 때 실수하면 무효가 될 수 있으므로, 변호사의 도움을 받는 것이 중요합니다. Will에서 특히 중요한 부분은 주택의 처분입니다. Will에서 주택을 구체적으로 언급하고(예: "나의 주택 located at [주소]는 [수혜자]에게 준다"), 주택의 가치를 포함합니다.

#### Living Trust(생전 신탁)를 통한 상속 계획
Living trust는 probate를 피하는 효과적인 방법입니다. 신탁자(trustor)가 살아있을 때 신탁을 설립하고 자산(주택 포함)을 신탁에 넣습니다. 신탁자는 신탁자 자신이 trustee(수탁자)가 되어 신탁 자산을 관리합니다. 신탁자가 사망하면 named successor trustee(지정된 후임 수탁자)가 신탁 자산을 관리하고 beneficiary(수혜자)에게 분배합니다. Living trust의 장점: (1) Probate 회피: 신탁의 자산은 probate를 거치지 않고 수혜자에게 전달됩니다. (2) Privacy: 신탁의 내용은 공개되지 않습니다. (3) Management: 신탁자가 무능력(incapacitated)해지면 successor trustee가 신탁 자산을 관리합니다. {st}에서 주택을 living trust에 넣으려면 deed를 신탁 이름으로 다시 기록(re-record)해야 합니다.

#### Transfer-on-Death Deed(사망 시 이전 증서)
일부 주에서는 transfer-on-death (TOD) deed를 인정합니다. 이는 주택 소유자가 사망할 때 주택이 지정된 수혜자에게 자동으로 이전되는 증서입니다. TOD deed의 장점은 probate를 회피하면서도 living trust보다 간단합니다. {st}에서 TOD deed를 사용할 수 있다면, 이는 주택 상속의 간단한 방법입니다. 그러나 모든 주가 TOD deed를 인정하지는 않으므로, 먼저 {st}의 법을 확인해야 합니다.

#### Probate 절차의 단계
만약 probate를 거쳐야 한다면, 절차는 다음과 같습니다. (1) Will 제출: 사망 후 will을 지방 법원에 제출합니다. (2) Executor 임명: 법원이 유언 집행자(executor)를 임명하거나, will에 지정된 executor를 확인합니다. (3) Estate 광고: 법원이 신문에 사망 통지를 게시합니다. (4) Creditor 청구 기간: creditor(채권자)들이 claims를 제시할 수 있는 기간(일반적으로 4-6개월). (5) Asset 확인: executor가 모든 자산을 확인하고 평가합니다. (6) Debt 납부: estate의 debt, tax, funeral expense 등을 납부합니다. (7) Asset 분배: 남은 자산을 beneficiary에게 분배합니다. Probate 절차는 6개월에서 2년 이상 소요될 수 있습니다.

#### Estate Tax(부동산세)와 Inheritance Tax(상속세)
미국 연방 차원에서 estate tax는 2025년 기준 $13.61 million 이상의 estate에 적용됩니다. {f}의 주택만으로는 대부분 이에 미치지 않지만, 여러 자산을 포함한 총 estate 가치가 이를 초과하면 estate tax를 내야 합니다. 일부 주(예: 뉴욕, 캘리포니아)에서는 자체 estate tax를 부과합니다. 또한 부동산의 사망 후 가치가 상당히 증가했다면, 상속인이 판매 시 capital gains tax를 내야 합니다. 다행히 step-up in basis라는 규칙이 있어서, 사망자의 자산은 사망 시점의 시장 가치(stepped-up basis)로 재평가되므로, 그 이후 appreciation에만 tax가 적용됩니다.

#### Probate 과정에서 주택의 처리
Probate 과정에서 주택이 어떻게 처리되는지는 중요합니다. Executor는 주택을 유지하고(유지비, 보험료 지불), 필요하면 repair를 하고, 최종적으로 will의 지정에 따라 분배하거나 판매합니다. 만약 probate 기간 중에 주택을 판매해야 한다면, executor는 법원의 승인을 얻어야 합니다(일부 주에서). 주택 판매 절차는 일반적인 부동산 거래와 유사하지만, probate estate가 판매 대금을 받습니다.

#### 상속 분쟁(Contested Probate)
Will의 유효성, executor의 행동, 또는 자산 분배에 대해 이의를 제기하면 contested probate가 됩니다. 예를 들어, 상속인이 will이 사기(fraud)나 undue influence로 인해 만들어졌다고 주장할 수 있습니다. Contested probate는 매우 비용이 크고 시간이 오래 걸립니다. 이를 피하려면 will을 명확하게 작성하고, 충분한 증인을 두며, 변호사의 지도를 받는 것이 중요합니다.

#### 상속 계획의 필요성
주택이 있는 모든 사람은 상속 계획(estate plan)을 세워야 합니다. 이는 다음을 포함합니다: (1) Will 또는 living trust. (2) Durable power of attorney(지속적 위임장): 당신이 무능력해졌을 때 재정을 관리할 수 있도록. (3) Healthcare proxy(의료 위임장): 의료 결정을 할 수 있도록. (4) Living will: 말기(end of life) 의료 결정을 미리 정하는 것. {{st}}에서 변호사와 상담하여 종합적인 상속 계획을 세우면, 가족의 부담을 크게 줄일 수 있습니다.

""",
        # 8. 환경 규제와 주택 거래
        f"""
### 8. 환경 규제와 주택 거래 (Environmental Regulations and Real Estate Transactions)

{f}에서 주택을 구매할 때, 환경 관련 규제와 공시(disclosure)는 중요한 법적 의무입니다. 이러한 규제 중 하나를 위반하거나 공시를 제대로 하지 않으면, 거래 후 심각한 법적, 재정적 문제가 발생할 수 있습니다.

#### Lead Paint(납 함유 페인트)의 위험과 공시
1978년 이전에 지어진 주택(대부분의 구식 주택이 해당)의 페인트에는 납(lead)이 포함되어 있을 가능성이 높습니다. 납은 매우 독성이 있어서, 특히 어린이의 뇌 발달에 영구적 손상을 줄 수 있습니다. 미국의 연방법(Residential Lead-Based Paint Hazard Disclosure Rule)은 1978년 이전의 주택 판매 시 lead paint의 위험을 공시하도록 요구합니다. 판매자는 lead paint의 알려진 모든 사건(incidents)과 보도(reports)를 공시해야 하며, 구매자는 거래 전 lead paint 검사를 할 기회를 가집니다. 만약 판매자가 lead paint 공시를 부당하게 생략했다면, 구매자는 이를 fraud로 소송할 수 있습니다.

#### Asbestos(석면)의 발견과 위험
1980년 이전의 많은 건물 자재(insulation, floor tiles, roofing, pipe wrapping 등)에는 석면이 포함되었습니다. 석면은 흡입하면 심각한 호흡기 질환(폐암, mesothelioma)을 일으킵니다. 석면이 있는 자재 자체는 위험하지 않지만, 손상되거나 제거될 때 석면 입자가 공중으로 날아갈 수 있습니다. {st}에서는 renovation이나 demolition 시 석면 제거를 규정하고 있습니다. 석면은 전문적으로 제거되어야 하며, 일반 건설 업체가 임의로 제거해서는 안 됩니다. 주택 구매 전 전문가의 asbestos inspection을 받는 것이 안전합니다.

#### Mold(곰팡이)의 발생과 책임
습기가 많은 곳에 자주 발생하는 곰팡이는 호흡기 질환을 일으킬 수 있습니다. 특히 black mold(검은 곰팡이, Stachybotrys)는 매우 독성이 있습니다. 판매자는 알려진 mold 문제를 공시해야 합니다. 그러나 많은 판매자들이 minor mold를 무시하거나 공시하지 않습니다. Mold는 습기 문제의 신호이므로, 주택 inspection 시 mold가 있는지 확인해야 합니다. Mold가 발견되면 전문가에게 remediation(제거)을 의뢰해야 합니다. 심각한 mold 문제가 있는 주택은 구매하지 않는 것이 좋습니다.

#### Radon(라돈)의 검사와 위험
Radon은 토양에서 발생하는 방사성 가스로, 주택의 지하실에 축적될 수 있습니다. 장기간 라돈에 노출되면 폐암의 위험이 증가합니다. {st}의 특정 지역(radon zone)에 있는 주택은 radon 위험이 높습니다. 미국 환경청(EPA)은 radon 검사를 권장하며, 4.0 pCi/L 이상이면 remediation이 필요합니다. Radon 검사는 비교적 저렴하며($100-300), 문제가 있으면 radon mitigation system을 설치합니다. 판매자가 radon 문제를 공시하지 않았다면 이를 소송 대상으로 할 수 있습니다.

#### Underground Storage Tanks(지하 저장 탱크)
오래된 주택에는 지하에 석유 저장 탱크(oil storage tank)가 있을 수 있습니다. 이 탱크가 누설되면 토양과 지하수 오염이 발생합니다. 환경 정화(environmental remediation)는 매우 비용이 많이 들 수 있습니다($10,000-100,000 이상). 거래 전에 tank의 존재와 상태를 확인해야 합니다. 일부 states에서는 tank의 공시를 의무화합니다. Tank를 발견하면 전문가에게 제거하는 것이 안전합니다.

#### Wetlands(습지)와 Protected Areas(보호 지역)
{f}의 주택이 wetland 근처에 있거나, 습지의 정의에 해당한다면, 연방 환경법(Clean Water Act)과 주 습지법이 적용됩니다. Wetland에서의 개발은 엄격히 규제되며, permit 없이는 진행할 수 없습니다. Wetland를 배수(drain)하거나 fill하는 행위는 큰 벌금을 초래합니다. 주택 구매 전에 wetland 여부를 확인하고, 있다면 개발 계획에 어떤 영향을 미칠지 이해해야 합니다.

#### Phase I Environmental Site Assessment(ESA)
상업 부동산이나 오염 위험이 있는 부동산을 구매할 때는 Phase I ESA를 의뢰합니다. 이는 부동산의 환경 오염 위험을 전문가가 평가하는 것입니다. 부동산의 역사(이전 사용), 주변 오염원, 현장 조사 등을 통해 오염 위험을 분석합니다. 위험이 발견되면 Phase II ESA(실제 토양/수질 샘플 검사)를 진행합니다. ESA 비용은 $1,500-3,000이지만, 큰 오염 문제를 발견하면 거래를 회피할 수 있으므로 매우 가치 있습니다.

#### 환경 공시(Environmental Disclosure Statement)
{st}의 판매자 공시 양식에는 환경 관련 항목들이 포함되어 있습니다. 판매자는 알려진 환경 문제(lead, asbestos, mold, radon 등)를 공시해야 합니다. 거짓 공시나 중요한 정보의 생략은 fraud의 근거가 될 수 있습니다. 구매자는 계약서에 Environmental inspection contingency를 포함시켜서 전문가 검사 후 문제가 발견되면 계약을 취소할 수 있도록 해야 합니다.

#### 오염된 부동산(Brownfield)의 정화와 법적 책임
Brownfield는 실제 또는 잠재적 오염이 있는 산업/상업 부동산입니다. 오염된 부동산의 소유자는 정화(remediation) 책임을 질 수 있습니다. 이는 Comprehensive Environmental Response, Compensation, and Liability Act (CERCLA)에 따릅니다. 그러나 innocent landowner liability protection, bona fide prospective purchaser defense 등의 면책이 있습니다. 오염된 부동산을 구매할 때는 반드시 환경 변호사의 상담을 받아야 합니다.

#### 기후 변화와 자연 재해 공시
최근에는 기후 변화와 관련된 환경 공시도 중요해지고 있습니다. {f}가 홍수, 산불, 폭풍 위험 지역에 있다면, 이를 알려야 합니다. 일부 주에서는 이러한 정보를 climate risk disclosure로 요구합니다. 구매자는 이러한 위험을 이해하고 적절한 보험을 준비해야 합니다.

""",
        # 9. 건축 허가와 조닝법
        f"""
### 9. 건축 허가와 조닝법 (Building Permits and Zoning Laws)

{f}에서 주택을 소유하고 개조(renovation), 확장(addition), 또는 신축(new construction)을 계획할 때, 건축 허가(building permit)와 조닝법(zoning law)은 매우 중요한 규제입니다. 이를 무시하면 벌금, 강제 철거, 소유권 문제까지 발생할 수 있습니다.

#### Zoning(조닝)의 기본 개념
Zoning은 지역을 용도(residential, commercial, industrial 등)별로 구분하여, 각 지역에서 허용되는 활동을 제한하는 규제입니다. {st}의 각 지역(municipality)은 zoning map과 zoning ordinance(조닝 조례)를 가지고 있습니다. {f}의 대부분은 residential zoning으로, 주택 거주만 허용되고 사업 운영은 제한됩니다. 만약 집에서 사업(예: 의료 사무실, 회계 사무실)을 운영하고 싶다면, 그것이 permitted use(허용된 용도)인지 확인해야 합니다. 많은 residential zone에서는 limited home-based business를 허용하지만, 용도와 규모에 따라 제한이 있습니다.

#### Permitted Use vs. Conditional Use vs. Non-Conforming Use
Permitted use는 zoning에서 명시적으로 허용되는 용도입니다. {f}의 residential zone에서는 주거는 permitted use이지만, 상점은 아닙니다. Conditional use(또는 special permit)는 특별한 조건 하에 허용되는 용도입니다. 예를 들어, 의료 사무실이 conditional use라면, 주민들과의 충분한 공고, 도로 접근성, 주차 등의 조건을 충족해야 합니다. Non-conforming use는 현재 zoning과 맞지 않지만, zoning 변경 이전에 이미 존재하던 용도입니다. 예를 들어, 지역이 원래 commercial zone이었다가 residential zone으로 변경되었을 때, 기존의 상점은 non-conforming use로 계속 운영할 수 있습니다. 그러나 non-conforming use는 법적으로 약할 수 있으므로, 운영자의 사망, 사업 중단 후 재개, 또는 significant expansion은 zoning authority의 승인이 필요합니다.

#### Setback(건축선)과 용적률(Lot Coverage)
Setback은 주택이 도로, 경계선 등으로부터 떨어져야 하는 거리입니다. {st}의 zoning ordinance는 일반적으로 "front setback 25 feet, side setback 10 feet, rear setback 30 feet"과 같이 규정합니다. {{f}} 지역의 구체적인 setback 요구사항을 확인해야 합니다. Lot coverage는 부지 전체 중 건물이 차지할 수 있는 비율입니다. 예를 들어, "maximum lot coverage 50%"라면, 부지가 10,000 sq ft일 때 건물은 최대 5,000 sq ft을 초과할 수 없습니다. 주택 확장(addition)을 계획할 때는 이 요구사항을 반드시 확인해야 합니다.

#### Height Restriction(높이 제한)과 Other Regulations
Zoning은 또한 주택의 높이를 제한할 수 있습니다. {{f}}의 residential zone에서 "maximum height 35 feet"라면, 주택은 35 feet를 초과할 수 없습니다. 이는 2층 또는 3층 주택으로 제한될 수 있습니다. 추가적인 규제로는 parking requirements, green space requirements(환경 친화적 공간 요구사항), 그리고 external appearance에 대한 requirements(예: fence의 높이, 색상 제한)가 있을 수 있습니다.

#### Variance(변수)의 신청과 승인
만약 당신의 부동산이 zoning requirement를 충족할 수 없다면, variance를 신청할 수 있습니다. Variance는 zoning requirement의 예외를 부여하는 것입니다. 예를 들어, 부지가 좁아서 required setback을 맞출 수 없거나, 높이 제한으로 인해 계획된 addition을 지을 수 없다면, variance를 신청합니다. Variance는 zoning board of appeals 또는 board of adjustment에 신청합니다. 신청자는 hardship(어려움)을 증명해야 합니다. 예를 들어, "부지의 특수한 형태로 인해 setback을 맞출 수 없으며, 이는 부지의 경제적 사용을 심각하게 제한한다"는 것을 입증해야 합니다. Variance 승인 절차는 공개 청문회를 포함하며, 이웃들이 반대할 수 있습니다. Variance 비용은 일반적으로 $300-1,000이고, 처리 기간은 2-3개월입니다.

#### Building Permit(건축 허가)의 필요성과 절차
{{f}}에서 주택 개조, 확장, 신축을 할 때 건축 허가가 필요합니다. 작은 수리(paint, flooring 등)는 일반적으로 허가가 불필요하지만, 구조 변경, 전기/배관 작업, 지붕 교체 등은 허가가 필요합니다. Building permit 신청 절차: (1) 완성된 건축 도면(architectural drawings) 준비. (2) Zoning compliance 확인(부지가 zoning을 만족하는지). (3) 건축 허가 신청서(building permit application) 작성. (4) 심사(review): 건축청(building department)이 도면과 요구사항 검토. (5) 허가 발급(permit issuance). (6) 검사(inspection): 공사 진행 중 정기적인 검사. (7) 최종 검사(final inspection): 공사 완료 후 모든 요구사항 충족 확인. (8) 허가(certificate of occupancy): 사용 가능 인증.

#### Unpermitted Work(무허가 공사)의 위험
무허가로 진행한 공사(illegal addition, unpermitted renovation 등)는 여러 문제를 일으킵니다. (1) 법적 문제: 벌금, 강제 철거 명령. (2) 판매 어려움: 향후 주택 판매 시 무허가 공사는 disclosure해야 하며, 구매자가 꺼릴 수 있습니다. (3) 보험 문제: 보험이 무허가 공사로 인한 손상을 보장하지 않을 수 있습니다. (4) 융자 문제: 대출 기관이 무허가 공사 때문에 refinancing을 거절할 수 있습니다. 중고 주택을 구매할 때 무허가 공사의 흔적이 있는지 확인하는 것이 중요합니다. Building department에 기록을 조회하여 과거의 모든 허가를 확인할 수 있습니다.

#### Historic Preservation(역사 보존)과 건축 제한
{{f}}의 특정 지역이 historic district(역사 지구)로 지정되었다면, 건축에 대한 추가 제한이 있습니다. Historic district에서는 외부 변경(exterior modifications)이 원래 건축 양식과 일치해야 합니다. 예를 들어, 역사 건축 양식이 wood siding인데 aluminum siding으로 교체할 수 없습니다. Historic preservation commission의 승인이 필요합니다. 이를 무시하면 벌금과 강제 복구 명령을 받을 수 있습니다.

#### Utility Easement(유틸리티 지역권)와 건축 제한
부동산의 지형도(survey)에는 utility easement가 표시됩니다. 전력선, 수도, 가스 회사는 유틸리티 유지를 위해 부동산의 특정 부분에 접근권을 가집니다. Easement 지역에서는 구조물이나 심은 나무 등으로 접근을 방해할 수 없습니다. 예를 들어, rear easement 위에 deck이나 shed를 지을 수 없습니다.

#### Zoning Compliance Verification
주택 개조나 확장을 계획하기 전에 반드시 zoning compliance를 확인해야 합니다. (1) 지역 building/planning department에 부지 방문. (2) Zoning map에서 부지의 zone 확인. (3) Zoning ordinance에서 해당 zone의 requirement 확인. (4) Site plan(부지 계획)을 작성하여 제안된 공사가 setback, lot coverage, height 등을 만족하는지 확인. (5) 변호사나 건축가의 자문 받기. 이러한 preliminary check는 향후 비용과 지연을 크게 줄일 수 있습니다.

""",
        # 10. 외국인/영주권자 부동산 매매 법률
        f"""
### 10. 외국인/영주권자 부동산 매매 법률 (Foreign Nationals/Permanent Residents Buying Property)

{f}에서 부동산 투자를 계획하는 외국인(foreign nationals)과 영주권자(permanent residents)를 위해 특별한 법적, 세금 고려사항이 있습니다. 이를 이해하지 못하면 세금 함정(tax trap)에 빠질 수 있습니다.

#### FIRPTA(Foreign Investment in Real Property Tax Act)
FIRPTA는 외국인이 미국 부동산을 판매할 때 capital gains tax를 처리하는 법입니다. 외국인이 부동산을 판매하면, 구매자는 판매 대금의 일부(일반적으로 15%)를 withhold(보류)하여 IRS에 보내야 합니다. 이는 외국인의 capital gains tax 납부를 보장하기 위한 조치입니다. 예를 들어, 외국인이 {ap}에서 구매한 주택을 나중에 더 높은 가격에 판매하면, 판매자는 구매자로부터 일부 금액이 withhold되는 것을 경험합니다.

다만, 다음의 경우는 FIRPTA withholding이 필요 없습니다: (1) 구매자가 주택을 primary residence로 사용할 계획이고, 구매 가격이 $300,000 이하. (2) 판매자가 공식 FIRPTA certificate of non-foreign status를 제출. (3) 판매자가 미국 시민 또는 resident alien.

#### IRS Individual Number(ITIN, 개인 세금 번호)
외국인이 미국 부동산을 구매하거나 소유할 때, IRS에 등록하려면 ITIN이 필요합니다. ITIN은 social security number (SSN)을 가지지 않은 외국인에게 발급됩니다. ITIN 신청은 IRS Form W-7을 사용하며, 신청자의 신원을 입증하는 document(passport, visa, national ID 등)가 필요합니다. ITIN을 받으면 tax return을 제출하고, property tax, mortgage interest deduction 등을 청구할 수 있습니다.

#### Financing(자금 조달)의 어려움
외국인이 미국에서 주택 구매 자금을 빌리기는 어렵습니다. 많은 대출 기관이 외국인에게 mortgage를 주지 않습니다. 요구사항이 엄격하며, 다음이 필요합니다: (1) Valid visa(유효한 비자). (2) ITIN 또는 SSN. (3) US bank account(미국 은행 계좌). (4) US credit history(미국 신용 기록). (5) Down payment(계약금): 일반적으로 30-50%.

일부 대출 기관(예: 특정 ethnic banks, 국제 은행)이 외국인에게 대출을 해주기도 합니다. 그러나 이자율이 일반적인 주택 대출보다 높습니다. 많은 외국인들은 현금(cash)으로 부동산을 구매하거나, 자국의 은행에서 자금을 받습니다.

#### State Laws(주 법)의 차이
주(state)마다 외국인의 부동산 소유에 대한 규제가 다릅니다. {{st}}에서는 어떤 특별한 제한이 있는지 확인해야 합니다. 일부 주는 외국인의 농지 소유를 제한합니다. 또한 state property tax에서 외국인이 더 높은 세율을 적용받을 수 있습니다.

#### Property Tax(재산세)와 Residency Status
외국인의 property tax 처리는 residency status에 따라 다릅니다. Resident alien은 미국인과 동일한 property tax를 냅니다. Non-resident alien은 더 높은 세율을 적용받을 수 있습니다. Property tax를 낮추려면 {{st}}의 homestead exemption을 신청할 수 있는지 확인해야 합니다. 많은 주는 homestead exemption을 resident만 주지만, 일부 주는 resident alien에게도 제공합니다.

#### Estate Tax(부동산세)와 상속
외국인 부동산 소유자가 사망하면, 그의 US property에 대해 federal estate tax가 적용됩니다. Estate tax의 exemption은 매우 제한적입니다($60,000 in 2025). 따라서 미국 부동산이 상당한 가치가 있으면, 상속인들이 큰 estate tax를 내야 합니다. 이를 피하기 위해 qualified domestic trust (QDOT) 또는 living trust를 사용할 수 있습니다.

#### Capital Gains Tax(양도소득세)
외국인이 부동산을 판매할 때 capital gain (판매 가격 - purchase price)에 대해 tax를 냅니다. Tax rate는 거주 기간, 판매 가격, 기타 소득에 따라 다릅니다. Resident alien은 15%-20%의 long-term capital gains tax를 적용받습니다. Non-resident alien은 30%의 tax를 적용받을 수 있습니다. 따라서 부동산 판매 계획을 할 때 세금을 고려해야 합니다.

#### 1031 Exchange(1031 교환)의 제약
1031 Exchange는 같은 가치의 investment property를 교환할 때 capital gains tax를 미루는 방법입니다. 그러나 이는 resident alien에게만 적용되며, non-resident alien은 사용할 수 없습니다. 만약 외국인 투자자가 부동산 포트폴리오를 구축하려면, 1031 exchange를 사용할 수 없다는 제약이 있습니다.

#### 세금 신고(Tax Reporting)의 필수성
외국인이 미국 부동산을 소유하면, IRS에 annual tax return을 제출해야 합니다. 부동산에서 income이 없다면(owner-occupied인 경우), tax return이 필요 없을 수도 있습니다. 그러나 rental income이 있다면 반드시 Form 1040 (US tax return)을 제출해야 합니다. Tax return 미제출은 significant penalty를 초래합니다.

#### 비자 상태와 부동산 소유의 영향
외국인의 비자 상태(visa status)는 부동산 소유에 영향을 미칩니다. Temporary visa holder (예: H-1B, L-1)는 부동산을 구매할 수 있지만, 비자 만료 후 부동산을 유지할 수 없을 수도 있습니다. 따라서 long-term 부동산 소유를 계획한다면, permanent residency를 먼저 취득하는 것이 안전합니다. 또한 visa fraud risk를 피하기 위해 실제 US residence(미국 거주)의 의도를 보여야 합니다.

#### 변호사와 CPA의 상담의 필요성
외국인의 부동산 거래는 매우 복잡하므로, 변호사(부동산 변호사)와 CPA(tax professional)의 상담이 필수입니다. 변호사는 계약서, FIRPTA withholding, financing 등의 법적 측면을 처리합니다. CPA는 tax planning, ITIN 신청, tax return 준비 등을 처리합니다. 처음부터 전문가의 도움을 받으면 향후 문제를 크게 줄일 수 있습니다.

""",
    ]
