# Edge test failures

EC-004 and EC-018 fail because UNIT_REPEAT does not match phrases where "再次/第二次" precedes the Unit phrase, such as "再次使用這個 Unit" or "這回合第二次使用已經 Spent 的 Unit".

Required fix: detect repeat-use semantics independently of word order, then inspect `state.unitState`. If state is `spent`, return `violation`; otherwise return `insufficient_information`.
