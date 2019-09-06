from iconservice import *

TAG = 'EVENTPOLL'


class EventPolling(IconScoreBase):
    _VOTE_RESULT = "vote_result"
    _YES_COUNT = "yes_count"
    _NO_COUNT = "no_count"

    @eventlog(indexed=2)
    def VotedEvent(self, txHash: str, votedBy: Address, vote: int):
        pass

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)
        Logger.debug(f'In __init__.', TAG)
        Logger.debug(f'owner is {self.owner}.', TAG)
        super().__init__(db)
        self._votes = DictDB(self._VOTE_RESULT, db, value_type=int)
        self._yes_total = VarDB(self._YES_COUNT, db, value_type=int)
        self._no_total = VarDB(self._NO_COUNT, db, value_type=int)


    def on_install(self) -> None:
        super().on_install()

    def on_update(self) -> None:
        super().on_update()

    @external(readonly=True)
    def get_vote_count(self) -> dict:
        resultDictDB = {}
        resultDictDB[self._YES_COUNT] = self._yes_total.get()
        resultDictDB[self._NO_COUNT] = self._no_total.get()

        Logger.info(f'get_vote_count : {resultDictDB}', TAG)
        return resultDictDB


    @external(readonly=True)
    def recent_vote(self) -> int:
        """ if address is in _votes then it voted"""
        _result = self._votes[self.msg.sender]
        Logger.info(f'_is_voted result for {self.msg.sender} : {_result}', TAG)
        if _result == 0:
            return 0
        else:
            return _result

    @external
    def vote(self, _vote: int) -> None:
        if _vote < 1 or _vote > 2:
            Logger.debug(f'Invalid vote number {_vote} .', TAG)
            revert(f'invalid vote')
        self._votes[self.msg.sender] = _vote

        if _vote == 1:
            self._yes_total.set(self._yes_total.get() + 1)
        if _vote == 2:
            self._no_total.set(self._no_total.get() + 1)
        self.VotedEvent(bytes.hex(self.tx.hash), self.msg.sender, _vote)

    def fallback(self):
        pass